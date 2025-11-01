import React, { useState, useEffect, useCallback, useMemo } from "react";
import CategoryCard from "./components/CategoryCard";
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

  const handleSave = useCallback(async () => {
    if (!isButtonEnabled) return;
    tg.MainButton.showProgress();
    tg.MainButton.disable();

    try {
      const telegramId = tg.initDataUnsafe?.user?.id;
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/usuario/${telegramId}/categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedIds: Array.from(seleccionadas) }),
      });

      if (!response.ok) throw new Error("Error al guardar en el servidor.");

      tg.sendData(JSON.stringify({ status: "ok" }));

      setTimeout(() => {
        tg.close();
      }, 100);
    } catch (error) {
      console.error("Error saving data:", error);
      tg.showAlert("No se pudieron guardar los cambios. Inténtalo de nuevo.");
      tg.MainButton.hideProgress();
      tg.MainButton.enable();
    }
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

  const handleToggle = (id, isParentClick = false) => {
    setIsButtonEnabled(true);
    setSeleccionadas((prev) => {
      const nuevas = new Set(prev);
      const children = subcategoriasMap[id] || [];
      const childrenIds = children.map((c) => c.id);
      const parentId = categorias.find((c) => c.id === id)?.padre_id;

      if (isParentClick) {
        const areAllSelected = childrenIds.length > 0 && childrenIds.every((childId) => nuevas.has(childId));
        if (areAllSelected) {
          childrenIds.forEach((childId) => nuevas.delete(childId));
        } else {
          childrenIds.forEach((childId) => nuevas.add(childId));
        }
      } else {
        nuevas.has(id) ? nuevas.delete(id) : nuevas.add(id);
      }

      if (parentId) {
        const parentChildrenIds = (subcategoriasMap[parentId] || []).map((c) => c.id);
        const allChildrenSelected = parentChildrenIds.every((childId) => nuevas.has(childId));
        allChildrenSelected ? nuevas.add(parentId) : nuevas.delete(parentId);
      }

      return nuevas;
    });
  };

  const getParentState = (cat) => {
    const children = subcategoriasMap[cat.id] || [];
    if (children.length === 0) {
      return seleccionadas.has(cat.id) ? "selected" : "";
    }
    const selectedCount = children.filter((sub) => seleccionadas.has(sub.id)).length;
    if (selectedCount === 0) return "";
    if (selectedCount === children.length) return "selected";
    return "partial";
  };

  const categoriasPrincipales = useMemo(() => categorias.filter((c) => !c.padre_id), [categorias]);

  return (
    <div className="app-container">
      <h1>Selecciona tus Intereses</h1>
      <p>Toca una categoría para ver más detalles y afinar tu selección.</p>
      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className="category-grid">
          {categoriasPrincipales.map((cat) => (
            <CategoryCard
              key={cat.id}
              categoria={cat}
              state={getParentState(cat)}
              onClick={() => {
                const subcats = subcategoriasMap[cat.id] || [];
                if (subcats.length > 0) {
                  setDrawerState({ open: true, categoria: cat });
                } else {
                  handleToggle(cat.id, false);
                }
              }}
            />
          ))}
        </div>
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
