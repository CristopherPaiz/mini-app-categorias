import React, { useState, useEffect, useCallback, useMemo } from "react";
import PasoPorcentaje from "./components/PasoPorcentaje";
import PasoPrecios from "./components/PasoPrecios";
import PasoCategorias from "./components/PasoCategorias";
import SubcategoryDrawer from "./components/SubcategoryDrawer";
import SkeletonLoader from "./components/Loader";
import "./App.css";

const tg = window.Telegram.WebApp;

function App() {
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(true);
  const [drawerState, setDrawerState] = useState({ open: false, categoria: null });
  const [categorias, setCategorias] = useState([]);

  const [preferencias, setPreferencias] = useState({
    porcentaje: 50,
    precioMin: 0,
    precioMax: 10000,
    seleccionadas: new Set(),
  });

  useEffect(() => {
    tg.ready();
    tg.expand();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const telegramId = tg.initDataUnsafe?.user?.id;
        if (!telegramId) throw new Error("ID de usuario no disponible.");

        const apiUrl = import.meta.env.VITE_API_URL;
        const [categoriasRes, preferenciasRes] = await Promise.all([
          fetch(`${apiUrl}/api/categorias`),
          fetch(`${apiUrl}/api/usuario/${telegramId}/preferencias`),
        ]);

        const categoriasData = await categoriasRes.json();
        const preferenciasData = await preferenciasRes.json();

        if (categoriasData.status === "success") {
          setCategorias(categoriasData.data.categorias);
        }
        if (preferenciasData.status === "success") {
          setPreferencias({
            porcentaje: preferenciasData.data.porcentajeDescuento,
            precioMin: preferenciasData.data.precioMin,
            precioMax: preferenciasData.data.precioMax,
            seleccionadas: new Set(preferenciasData.data.selectedIds),
          });
        }
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
    tg.MainButton.showProgress();
    tg.MainButton.disable();

    try {
      const telegramId = tg.initDataUnsafe?.user?.id;
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/usuario/${telegramId}/configuracion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          porcentajeDescuento: preferencias.porcentaje,
          precioMin: preferencias.precioMin,
          precioMax: preferencias.precioMax,
          selectedIds: Array.from(preferencias.seleccionadas),
        }),
      });

      if (!response.ok) throw new Error("Error al guardar en el servidor.");

      tg.sendData(JSON.stringify({ status: "success" }));
      tg.close();
    } catch (error) {
      console.error("Error saving data:", error);
      tg.showAlert("No se pudieron guardar los cambios. Inténtalo de nuevo.");
      tg.MainButton.hideProgress();
      tg.MainButton.enable();
    }
  }, [preferencias]);

  const handleNext = () => setPaso((p) => Math.min(p + 1, 3));

  useEffect(() => {
    const buttonText = paso === 3 ? "Guardar Cambios" : "Siguiente";
    const buttonAction = paso === 3 ? handleSave : handleNext;

    tg.MainButton.setParams({ text: buttonText, is_active: true, is_visible: !loading });
    tg.onEvent("mainButtonClicked", buttonAction);

    return () => tg.offEvent("mainButtonClicked", buttonAction);
  }, [paso, handleSave, loading]);

  useEffect(() => {
    if (paso > 1) {
      tg.BackButton.show();
    } else {
      tg.BackButton.hide();
    }
  }, [paso]);

  const handleBack = useCallback(() => {
    setPaso((p) => Math.max(p - 1, 1));
  }, []);

  useEffect(() => {
    tg.onEvent("backButtonClicked", handleBack);
    return () => tg.offEvent("backButtonClicked", handleBack);
  }, [handleBack]);

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

  const handleToggleCategoria = (id, isParentClick = false) => {
    setPreferencias((prev) => {
      const nuevasSeleccionadas = new Set(prev.seleccionadas);
      const children = subcategoriasMap[id] || [];
      const childrenIds = children.map((c) => c.id);

      if (isParentClick) {
        const areAllSelected = childrenIds.length > 0 && childrenIds.every((childId) => nuevasSeleccionadas.has(childId));
        if (areAllSelected) {
          childrenIds.forEach((childId) => nuevasSeleccionadas.delete(childId));
        } else {
          childrenIds.forEach((childId) => nuevasSeleccionadas.add(childId));
        }
      } else {
        nuevasSeleccionadas.has(id) ? nuevasSeleccionadas.delete(id) : nuevasSeleccionadas.add(id);
      }
      return { ...prev, seleccionadas: nuevasSeleccionadas };
    });
  };

  const categoriasPrincipales = useMemo(() => categorias.filter((c) => !c.padre_id), [categorias]);

  const renderStep = () => {
    switch (paso) {
      case 1:
        return (
          <PasoPorcentaje porcentaje={preferencias.porcentaje} onPorcentajeChange={(p) => setPreferencias({ ...preferencias, porcentaje: p })} />
        );
      case 2:
        return (
          <PasoPrecios
            precioMin={preferencias.precioMin}
            precioMax={preferencias.precioMax}
            onPreciosChange={(min, max) => setPreferencias({ ...preferencias, precioMin: min, precioMax: max })}
          />
        );
      case 3:
        return (
          <PasoCategorias
            categoriasPrincipales={categoriasPrincipales}
            subcategoriasMap={subcategoriasMap}
            seleccionadas={preferencias.seleccionadas}
            onToggle={handleToggleCategoria}
            onOpenDrawer={(cat) => setDrawerState({ open: true, categoria: cat })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className="stepper-content">
          <div className={`step-wrapper ${paso === 1 ? "active" : ""}`}>{renderStep()}</div>
          <div className={`step-wrapper ${paso === 2 ? "active" : ""}`}>{renderStep()}</div>
          <div className={`step-wrapper ${paso === 3 ? "active" : ""}`}>{renderStep()}</div>
        </div>
      )}
      <SubcategoryDrawer
        open={drawerState.open}
        onOpenChange={(open) => setDrawerState({ ...drawerState, open })}
        categoria={drawerState.categoria}
        subcategorias={subcategoriasMap[drawerState.categoria?.id] || []}
        seleccionadas={preferencias.seleccionadas}
        onToggle={handleToggleCategoria}
      />
    </div>
  );
}

export default App;
