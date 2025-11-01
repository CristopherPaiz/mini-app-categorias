import React, { useState, useEffect, useCallback, useMemo } from "react";
import CategoryItem from "./components/CategoryItem";
import SkeletonLoader from "./components/Loader";
import "./App.css";

const tg = window.Telegram.WebApp;

function App() {
  const [categorias, setCategorias] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  useEffect(() => {
    tg.ready();
    tg.expand();
    document.body.style.backgroundColor = tg.themeParams.bg_color || "#ffffff";
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const telegramId = tg.initDataUnsafe?.user?.id;
        if (!telegramId) throw new Error("ID de usuario no disponible.");

        const apiUrl = import.meta.env.VITE_API_URL;
        const [categoriasRes, seleccionadasRes] = await Promise.all([
          fetch(`${apiUrl}/api/categorias`),
          fetch(`${apiUrl}/api/usuario/${telegramId}/categorias`),
        ]);

        const categoriasData = await categoriasRes.json();
        const seleccionadasData = await seleccionadasRes.json();

        if (categoriasData.status === "success") setCategorias(categoriasData.data.categorias);
        if (seleccionadasData.status === "success") setSeleccionadas(new Set(seleccionadasData.data.selectedIds));
      } catch (error) {
        console.error("Error fetching initial data:", error);
        tg.showAlert("No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleSave = useCallback(() => {
    if (!isButtonEnabled) return;
    tg.MainButton.showProgress();
    const dataToSend = JSON.stringify({ selectedIds: Array.from(seleccionadas) });
    tg.sendData(dataToSend);
    setTimeout(() => tg.close(), 500);
  }, [seleccionadas, isButtonEnabled]);

  useEffect(() => {
    tg.MainButton.setParams({ text: "Guardar Cambios", is_active: isButtonEnabled, is_visible: true });
    tg.onEvent("mainButtonClicked", handleSave);
    return () => tg.offEvent("mainButtonClicked", handleSave);
  }, [handleSave, isButtonEnabled]);

  const subcategoriasMap = useMemo(
    () =>
      categorias.reduce((acc, cat) => {
        if (cat.padre_id) {
          if (!acc[cat.padre_id]) acc[cat.padre_id] = [];
          acc[cat.padre_id].push(cat);
        }
        return acc;
      }, {}),
    [categorias]
  );

  const handleToggle = (id, isParentToggle) => {
    setIsButtonEnabled(true);
    setSeleccionadas((prev) => {
      const nuevas = new Set(prev);
      const children = subcategoriasMap[id] || [];
      const childrenIds = children.map((c) => c.id);

      if (isParentToggle) {
        const areAllChildrenSelected = childrenIds.every((childId) => prev.has(childId));
        if (areAllChildrenSelected) {
          childrenIds.forEach((childId) => nuevas.delete(childId));
        } else {
          childrenIds.forEach((childId) => nuevas.add(childId));
        }
      } else {
        nuevas.has(id) ? nuevas.delete(id) : nuevas.add(id);
      }
      return nuevas;
    });
  };

  const categoriasPrincipales = useMemo(() => categorias.filter((c) => !c.padre_id), [categorias]);

  return (
    <div className="app-container">
      <h1>Selecciona tus Intereses</h1>
      <p>Elige las categorías que más te gusten para recibir ofertas personalizadas.</p>
      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className="category-list">
          {categoriasPrincipales.map((cat) => (
            <CategoryItem
              key={cat.id}
              categoria={cat}
              subcategorias={subcategoriasMap[cat.id] || []}
              seleccionadas={seleccionadas}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
