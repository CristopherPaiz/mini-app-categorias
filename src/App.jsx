import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import "./App.css";

const tg = window.Telegram.WebApp;

const CategoriaItem = ({ categoria, categoriasPorPadre, seleccionadas, onToggle }) => {
  const subcategorias = categoriasPorPadre[categoria.id] || [];
  const estaSeleccionada = seleccionadas.has(categoria.id);

  return (
    <li className="category-item">
      <label className="category-label">
        <input type="checkbox" checked={estaSeleccionada} onChange={() => onToggle(categoria.id)} />
        {categoria.emoji} {categoria.nombre}
      </label>
      {subcategorias.length > 0 && (
        <ul>
          {subcategorias.map((sub) => (
            <CategoriaItem key={sub.id} categoria={sub} categoriasPorPadre={categoriasPorPadre} seleccionadas={seleccionadas} onToggle={onToggle} />
          ))}
        </ul>
      )}
    </li>
  );
};

CategoriaItem.propTypes = {
  categoria: PropTypes.object.isRequired,
  categoriasPorPadre: PropTypes.object.isRequired,
  seleccionadas: PropTypes.instanceOf(Set).isRequired,
  onToggle: PropTypes.func.isRequired,
};

function App() {
  const [categorias, setCategorias] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tg.ready();
    tg.expand();

    tg.setHeaderColor(tg.themeParams.bg_color || "#ffffff");
    document.body.style.backgroundColor = tg.themeParams.bg_color || "#ffffff";

    const fetchInitialData = async () => {
      try {
        const telegramId = tg.initDataUnsafe?.user?.id;
        if (!telegramId) {
          throw new Error("No se pudo obtener el ID de usuario de Telegram.");
        }

        const apiUrl = import.meta.env.VITE_API_URL;

        const [categoriasRes, seleccionadasRes] = await Promise.all([
          fetch(`${apiUrl}/api/categorias`),
          fetch(`${apiUrl}/api/usuario/${telegramId}/categorias`),
        ]);

        const categoriasData = await categoriasRes.json();
        const seleccionadasData = await seleccionadasRes.json();

        if (categoriasData.status === "success") {
          setCategorias(categoriasData.data.categorias);
        }
        if (seleccionadasData.status === "success") {
          setSeleccionadas(new Set(seleccionadasData.data.selectedIds));
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        tg.showAlert("No se pudieron cargar los datos. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSave = useCallback(() => {
    const dataToSend = JSON.stringify({ selectedIds: Array.from(seleccionadas) });
    tg.sendData(dataToSend);
  }, [seleccionadas]);

  useEffect(() => {
    tg.MainButton.text = "Guardar Cambios";
    tg.MainButton.onClick(handleSave);
    tg.MainButton.show();

    return () => {
      tg.MainButton.offClick(handleSave);
    };
  }, [handleSave]);

  const handleToggleCategoria = (id) => {
    setSeleccionadas((prev) => {
      const nuevas = new Set(prev);
      if (nuevas.has(id)) {
        nuevas.delete(id);
      } else {
        nuevas.add(id);
      }
      return nuevas;
    });
  };

  const categoriasPorPadre = categorias.reduce((acc, cat) => {
    const padreId = cat.padre_id || "principales";
    if (!acc[padreId]) acc[padreId] = [];
    acc[padreId].push(cat);
    return acc;
  }, {});

  const categoriasPrincipales = categoriasPorPadre["principales"] || [];

  if (loading) {
    return <div>Cargando categorías...</div>;
  }

  return (
    <div>
      <h1>Selecciona tus Categorías</h1>
      <p>Elige las categorías que más te interesan para recibir ofertas personalizadas.</p>
      <ul>
        {categoriasPrincipales.map((cat) => (
          <CategoriaItem
            key={cat.id}
            categoria={cat}
            categoriasPorPadre={categoriasPorPadre}
            seleccionadas={seleccionadas}
            onToggle={handleToggleCategoria}
          />
        ))}
      </ul>
    </div>
  );
}

export default App;
