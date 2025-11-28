import React, { useState, useEffect, useCallback, useMemo } from "react";
import PasoNombre from "./components/PasoNombre";
import PasoPorcentaje from "./components/PasoPorcentaje";
import PasoPrecios from "./components/PasoPrecios";
import PasoCategorias from "./components/PasoCategorias";
import PasoFuentes from "./components/PasoFuentes";
import SubcategoryDrawer from "./components/SubcategoryDrawer";
import SkeletonLoader from "./components/Loader";
import "./App.css";

const tg = window.Telegram.WebApp;

function App() {
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(true);
  const [drawerState, setDrawerState] = useState({ open: false, categoria: null });
  const [categorias, setCategorias] = useState([]);
  const [fuentes, setFuentes] = useState([]);

  const [preferencias, setPreferencias] = useState({
    nombre: "",
    porcentaje: 50,
    precioMin: 0,
    precioMax: 10000,
    seleccionadas: new Set(),
    fuentesSeleccionadas: new Set(),
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
        const [categoriasRes, preferenciasRes, fuentesRes, fuentesUsuarioRes] = await Promise.all([
          fetch(`${apiUrl}/api/categorias`),
          fetch(`${apiUrl}/api/usuario/${telegramId}/preferencias`),
          fetch(`${apiUrl}/api/fuentes`),
          fetch(`${apiUrl}/api/usuario/${telegramId}/fuentes`),
        ]);

        const categoriasData = await categoriasRes.json();
        const preferenciasData = await preferenciasRes.json();
        const fuentesData = await fuentesRes.json();
        const fuentesUsuarioData = await fuentesUsuarioRes.json();

        if (categoriasData.status === "success") {
          setCategorias(categoriasData.data.categorias);
        }
        if (fuentesData.status === "success") {
          setFuentes(fuentesData.data);
        }

        if (preferenciasData.status === "success") {
          const fuentesIds = fuentesUsuarioData.status === "success" ? fuentesUsuarioData.data.map((f) => f.id) : [];

          setPreferencias({
            nombre: preferenciasData.data.nombre,
            porcentaje: preferenciasData.data.porcentajeDescuento,
            precioMin: preferenciasData.data.precioMin,
            precioMax: preferenciasData.data.precioMax,
            seleccionadas: new Set(preferenciasData.data.selectedIds),
            fuentesSeleccionadas: new Set(fuentesIds),
          });
          if (preferenciasData.data.nombre && preferenciasData.data.nombre.trim().length > 0) {
            setPaso(2);
          }
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

    const telegramId = tg.initDataUnsafe?.user?.id;
    const apiUrl = import.meta.env.VITE_API_URL;

    if (!telegramId) {
      console.error("No se pudo obtener el Telegram ID");
      tg.MainButton.hideProgress();
      tg.MainButton.enable();
      alert("Error: No se pudo identificar al usuario.");
      return;
    }

    const dataToSend = {
      nombre: preferencias.nombre,
      porcentajeDescuento: preferencias.porcentaje,
      precioMin: preferencias.precioMin,
      precioMax: preferencias.precioMax,
      selectedIds: Array.from(preferencias.seleccionadas),
    };

    const fuentesToSend = {
      fuentesIds: Array.from(preferencias.fuentesSeleccionadas),
    };

    try {
      // Guardar configuración general
      const responseConfig = await fetch(`${apiUrl}/api/usuario/${telegramId}/configuracion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      // Guardar fuentes seleccionadas
      const responseFuentes = await fetch(`${apiUrl}/api/usuario/${telegramId}/fuentes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fuentesToSend),
      });

      if (responseConfig.ok && responseFuentes.ok) {
        tg.close();
      } else {
        console.error("Error al guardar configuración en API");
        tg.MainButton.hideProgress();
        tg.MainButton.enable();
        alert("Hubo un error al guardar. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      tg.MainButton.hideProgress();
      tg.MainButton.enable();
      alert("Error de conexión. Verifica tu internet.");
    }
  }, [preferencias]);

  const handleNext = () => setPaso((p) => Math.min(p + 1, 5));

  useEffect(() => {
    const buttonText = paso === 5 ? "Guardar Cambios" : "Siguiente";
    const buttonAction = paso === 5 ? handleSave : handleNext;
    const isEnabled = paso === 1 ? preferencias.nombre.trim().length > 0 : true;

    tg.MainButton.setParams({ text: buttonText, is_active: isEnabled, is_visible: !loading });
    tg.onEvent("mainButtonClicked", buttonAction);

    return () => tg.offEvent("mainButtonClicked", buttonAction);
  }, [paso, handleSave, loading, preferencias.nombre]);

  const handleBack = useCallback(() => {
    setPaso((p) => Math.max(p - 1, 1));
  }, []);

  useEffect(() => {
    if (paso > 1) {
      tg.BackButton.show();
    } else {
      tg.BackButton.hide();
    }
    tg.onEvent("backButtonClicked", handleBack);
    return () => tg.offEvent("backButtonClicked", handleBack);
  }, [paso, handleBack]);

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

  const handleToggleFuente = (id) => {
    setPreferencias((prev) => {
      const nuevasFuentes = new Set(prev.fuentesSeleccionadas);
      nuevasFuentes.has(id) ? nuevasFuentes.delete(id) : nuevasFuentes.add(id);
      return { ...prev, fuentesSeleccionadas: nuevasFuentes };
    });
  };

  const categoriasPrincipales = useMemo(() => categorias.filter((c) => !c.padre_id), [categorias]);

  const renderStep = () => {
    switch (paso) {
      case 1:
        return <PasoNombre nombre={preferencias.nombre} onNombreChange={(n) => setPreferencias({ ...preferencias, nombre: n })} />;
      case 2:
        return (
          <PasoPorcentaje porcentaje={preferencias.porcentaje} onPorcentajeChange={(p) => setPreferencias({ ...preferencias, porcentaje: p })} />
        );
      case 3:
        return (
          <PasoPrecios
            precioMin={preferencias.precioMin}
            precioMax={preferencias.precioMax}
            onPreciosChange={(min, max) => setPreferencias({ ...preferencias, precioMin: min, precioMax: max })}
          />
        );
      case 4:
        return (
          <PasoCategorias
            categoriasPrincipales={categoriasPrincipales}
            subcategoriasMap={subcategoriasMap}
            seleccionadas={preferencias.seleccionadas}
            onToggle={handleToggleCategoria}
            onOpenDrawer={(cat) => setDrawerState({ open: true, categoria: cat })}
          />
        );
      case 5:
        return <PasoFuentes fuentes={fuentes} seleccionadas={preferencias.fuentesSeleccionadas} onToggle={handleToggleFuente} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {loading ? (
        <SkeletonLoader />
      ) : (
        <div className="step-content-wrapper" key={paso}>
          {renderStep()}
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
