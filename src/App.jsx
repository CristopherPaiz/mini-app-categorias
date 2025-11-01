import React, { useState, useEffect, useCallback } from "react";
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

  const handleToggle = (id) => {
    setIsButtonEnabled(true);
    setSeleccionadas((prev) => {
      const nuevas = new Set(prev);
      nuevas.has(id) ? nuevas.delete(id) : nuevas.add(id);
      return nuevas;
    });
  };

  const categoriasPorPadre = React.useMemo(
    () =>
      categorias.reduce((acc, cat) => {
        const padreId = cat.padre_id || "principales";
        if (!acc[padreId]) acc[padreId] = [];
        acc[padreId].push(cat);
        return acc;
      }, {}),
    [categorias]
  );

  const handleCategoryClick = (categoria) => {
    const subcategorias = categoriasPorPadre[categoria.id] || [];
    if (subcategorias.length > 0) {
      setDrawerState({ open: true, categoria });
    } else {
      handleToggle(categoria.id);
    }
  };

  return (
    <div className="app-container">
      <h1>Selecciona tus Intereses</h1>
      <p>Elige las categorías que más te gusten para recibir ofertas personalizadas.</p>
      {loading ? (
        <SkeletonLoader />
      ) : (
        <CategoryGrid
          categoriasPrincipales={categoriasPorPadre["principales"] || []}
          seleccionadas={seleccionadas}
          onCategoryClick={handleCategoryClick}
          onToggle={handleToggle}
        />
      )}
      <SubcategoryDrawer
        open={drawerState.open}
        onOpenChange={(open) => setDrawerState({ ...drawerState, open })}
        categoria={drawerState.categoria}
        subcategorias={categoriasPorPadre[drawerState.categoria?.id] || []}
        seleccionadas={seleccionadas}
        onToggle={handleToggle}
      />
    </div>
  );
}

export default App;
