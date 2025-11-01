import React, { useState, useEffect, useCallback } from "react";
import CategoryList from "./components/CategoryList";
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
    document.body.style.backgroundColor = tg.themeParams.secondary_bg_color || "#f0f0f0";

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
        if (seleccionadasData.status === "success") {
          const initialSelected = new Set(seleccionadasData.data.selectedIds);
          setSeleccionadas(initialSelected);
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

  const handleSave = useCallback(() => {
    if (!isButtonEnabled) return;

    tg.MainButton.showProgress();
    const dataToSend = JSON.stringify({ selectedIds: Array.from(seleccionadas) });
    tg.sendData(dataToSend);

    setTimeout(() => {
      tg.close();
    }, 500);
  }, [seleccionadas, isButtonEnabled]);

  useEffect(() => {
    tg.MainButton.setParams({
      text: "Guardar Cambios",
      is_active: isButtonEnabled,
      is_visible: true,
    });
    tg.onEvent("mainButtonClicked", handleSave);

    return () => {
      tg.offEvent("mainButtonClicked", handleSave);
    };
  }, [handleSave, isButtonEnabled]);

  const handleToggleCategoria = (id) => {
    setIsButtonEnabled(true);
    setSeleccionadas((prev) => {
      const nuevas = new Set(prev);
      nuevas.has(id) ? nuevas.delete(id) : nuevas.add(id);
      return nuevas;
    });
  };

  return (
    <div>
      <h1>Selecciona tus Categorías</h1>
      <p>Elige todo lo que te interesa para recibir ofertas personalizadas.</p>
      {loading ? <SkeletonLoader /> : <CategoryList categorias={categorias} seleccionadas={seleccionadas} onToggle={handleToggleCategoria} />}
    </div>
  );
}

export default App;
