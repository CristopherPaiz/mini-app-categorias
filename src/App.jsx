import React, { useState, useEffect, useCallback, useMemo } from "react";
import CategoryGrid from "./components/CategoryGrid";
import SubcategoryDrawer from "./components/SubcategoryDrawer";
import SkeletonLoader from "./components/Loader";
import "./App.css";

const tg = window.Telegram.WebApp;

function App() {
  const [categorias, setCategorias] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [drawerState, setDrawerState] = useState({ open: false, categoria: null });

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

  const handleToggle = (id, isParentToggle = false) => {
    setIsButtonEnabled(true);
    setSeleccionadas((prev) => {
      const nuevas = new Set(prev);
      const children = subcategoriasMap[id] || [];
      const isChecked = prev.has(id);

      if (isParentToggle) {
        if (isChecked) {
          nuevas.delete(id);
          children.forEach((child) => nuevas.delete(child.id));
        } else {
          nuevas.add(id);
          children.forEach((child) => nuevas.add(child.id));
        }
      } else {
        nuevas.has(id) ? nuevas.delete(id) : nuevas.add(id);
        const parent = categorias.find((cat) => cat.id === id)?.padre_id;
        if (parent) {
          const parentChildren = subcategoriasMap[parent] || [];
          const allChildrenSelected = parentChildren.every((child) => nuevas.has(child.id));
          allChildrenSelected ? nuevas.add(parent) : nuevas.delete(parent);
        }
      }
      return nuevas;
    });
  };

  const handleOpenDrawer = (categoria) => {
    setDrawerState({ open: true, categoria });
  };

  return (
    <div className="app-container">
      <h1>Selecciona tus Intereses</h1>
      <p>Elige las categorías que más te gusten para recibir ofertas personalizadas.</p>
      {loading ? (
        <SkeletonLoader />
      ) : (
        <CategoryGrid
          categoriasPrincipales={categorias.filter((c) => !c.padre_id)}
          subcategoriasMap={subcategoriasMap}
          seleccionadas={seleccionadas}
          onOpenDrawer={handleOpenDrawer}
          onToggle={handleToggle}
        />
      )}
      <SubcategoryDrawer
        open={drawerState.open}
        onOpenChange={(open) => setDrawerState({ ...drawerState, open })}
        categoria={drawerState.categoria}
        subcategorias={subcategoriasMap[drawerState.categoria?.id] || []}
        seleccionadas={seleccionadas}
        onToggle={handleToggle}
      />
    </div>
  );
}

export default App;
