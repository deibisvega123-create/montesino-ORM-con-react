
import { useEffect, useState } from "react";
import "./App.css";

const API = "https://montesino-orm-con-react-3.onrender.com";

function App() {
  const [seccion, setSeccion] = useState("productos");
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");

      const respuestas = await Promise.all([
        fetch(`${API}/products`),
        fetch(`${API}/categorias`),
        fetch(`${API}/entradas`)
      ]);

      if (respuestas.some(res => !res.ok)) {
        throw new Error("Error al consultar el servidor");
      }

      const [p, c, e] = await Promise.all(
        respuestas.map(res => res.json())
      );

      setProductos(p);
      setCategorias(c);
      setEntradas(e);
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor Flask.");
    } finally {
      setCargando(false);
    }
  }

  const stockTotal = productos.reduce(
    (total, p) => total + Number(p.stock_min || 0), 0
  );

  const disponibles = productos.filter(p => p.disponible).length;

  const filtrar = (lista, campos) => lista.filter(item =>
    campos.some(campo =>
      String(item[campo] ?? "")
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    )
  );

  const dinero = valor =>
    Number(valor || 0).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    });

  function cambiarSeccion(nombre) {
    setSeccion(nombre);
    setBusqueda("");
  }

  const titulos = {
    productos: "Inventario de productos",
    categorias: "Categorías",
    entradas: "Entradas de inventario"
  };

  return (
    <div className="dashboard">

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>StockFlow</h2>
            <span>INVENTORY SYSTEM</span>
          </div>
        </div>

        <div className="menu-label">GENERAL</div>

        <nav className="navigation">
          <button
            className={seccion === "productos" ? "nav-item active" : "nav-item"}
            onClick={() => cambiarSeccion("productos")}
          >
            <span>▦</span> Productos
          </button>

          <button
            className={seccion === "categorias" ? "nav-item active" : "nav-item"}
            onClick={() => cambiarSeccion("categorias")}
          >
            <span>▤</span> Categorías
          </button>

          <button
            className={seccion === "entradas" ? "nav-item active" : "nav-item"}
            onClick={() => cambiarSeccion("entradas")}
          >
            <span>⇧</span> Entradas
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-avatar">AD</div>
          <div>
            <strong>Administrador</strong>
            <small>Panel de gestión</small>
          </div>
        </div>
      </aside>

      <main className="main-content">

        <header className="topbar">
          <div>
            <div className="breadcrumb">Panel principal / {titulos[seccion]}</div>
            <h1>{titulos[seccion]}</h1>
            <p>Gestiona y consulta la información de tu inventario.</p>
          </div>

          <button className="refresh-button" onClick={cargarDatos}>
            ↻ <span>Actualizar</span>
          </button>
        </header>

        {error && <div className="error-message">{error}</div>}

        {cargando ? (
          <div className="loading">Cargando información...</div>
        ) : (
          <>
            {seccion === "productos" && (
              <>
                <section className="stats">
                  <article className="stat-card">
                    <div className="stat-top">
                      <span>Total de productos</span>
                      <div className="stat-icon blue">▦</div>
                    </div>
                    <h2>{productos.length}</h2>
                    <small>Productos registrados</small>
                  </article>

                  <article className="stat-card">
                    <div className="stat-top">
                      <span>Stock mínimo acumulado</span>
                      <div className="stat-icon purple">▥</div>
                    </div>
                    <h2>{stockTotal}</h2>
                    <small>Suma de stock mínimo</small>
                  </article>

                  <article className="stat-card">
                    <div className="stat-top">
                      <span>Disponibles</span>
                      <div className="stat-icon green">✓</div>
                    </div>
                    <h2>{disponibles}</h2>
                    <small>Productos disponibles</small>
                  </article>
                </section>

                <section className="content-card">
                  <div className="card-heading">
                    <div>
                      <h2>Todos los productos</h2>
                      <p>Listado general de productos registrados.</p>
                    </div>
                    <span className="record-count">{productos.length} registros</span>
                  </div>

                  <input
                    className="search-input"
                    placeholder="⌕  Buscar producto por nombre..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />

                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>PRODUCTO</th>
                          <th>PRECIO</th>
                          <th>STOCK MÍNIMO</th>
                          <th>CATEGORÍA</th>
                          <th>ESTADO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtrar(productos, ["nombre", "categoria_nombre"]).map(p => (
                          <tr key={p.id}>
                            <td className="id-cell">#{p.id}</td>
                            <td><strong>{p.nombre}</strong></td>
                            <td>{dinero(p.precio)}</td>
                            <td>{p.stock_min}</td>
                            <td>{p.categoria_nombre || "Sin categoría"}</td>
                            <td>
                              <span className={`status ${p.disponible ? "available" : "unavailable"}`}>
                                {p.disponible ? "Disponible" : "No disponible"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {productos.length === 0 && <div className="empty">No hay productos registrados.</div>}
                  </div>
                </section>
              </>
            )}

            {seccion === "categorias" && (
              <section className="content-card">
                <div className="card-heading">
                  <div>
                    <h2>Administración de categorías</h2>
                    <p>Consulta las categorías de tus productos.</p>
                  </div>
                  <span className="record-count">{categorias.length} registros</span>
                </div>

                <input
                  className="search-input"
                  placeholder="⌕  Buscar categoría..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />

                <div className="category-grid">
                  {filtrar(categorias, ["nombre", "descripcion"]).map(c => (
                    <article className="category-card" key={c.id}>
                      <div className="category-icon">▤</div>
                      <span className="category-id">CATEGORÍA #{c.id}</span>
                      <h3>{c.nombre}</h3>
                      <p>{c.descripcion || "Sin descripción disponible."}</p>
                    </article>
                  ))}
                </div>
                {categorias.length === 0 && <div className="empty">No hay categorías registradas.</div>}
              </section>
            )}

            {seccion === "entradas" && (
              <>
                <section className="stats">
                  <article className="stat-card">
                    <div className="stat-top">
                      <span>Total de entradas</span>
                      <div className="stat-icon blue">⇧</div>
                    </div>
                    <h2>{entradas.length}</h2>
                    <small>Registros de ingreso</small>
                  </article>

                  <article className="stat-card">
                    <div className="stat-top">
                      <span>Unidades ingresadas</span>
                      <div className="stat-icon green">▥</div>
                    </div>
                    <h2>{entradas.reduce((s, e) => s + Number(e.cantidad || 0), 0)}</h2>
                    <small>Suma de cantidades</small>
                  </article>

                  <article className="stat-card">
                    <div className="stat-top">
                      <span>Productos diferentes</span>
                      <div className="stat-icon purple">▦</div>
                    </div>
                    <h2>{new Set(entradas.map(e => e.producto_id)).size}</h2>
                    <small>Con entradas registradas</small>
                  </article>
                </section>

                <section className="content-card">
                  <div className="card-heading">
                    <div>
                      <h2>Historial de entradas</h2>
                      <p>Registro de ingresos al inventario.</p>
                    </div>
                    <span className="record-count">{entradas.length} registros</span>
                  </div>

                  <input
                    className="search-input"
                    placeholder="⌕  Buscar por producto o factura..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />

                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>PRODUCTO</th>
                          <th>CANTIDAD</th>
                          <th>FACTURA</th>
                          <th>ESTANTE</th>
                          <th>UBICACIÓN</th>
                          <th>FECHA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtrar(entradas, ["producto_nombre", "factura", "stand", "ubicacion"]).map(e => (
                          <tr key={e.id}>
                            <td className="id-cell">#{e.id}</td>
                            <td><strong>{e.producto_nombre}</strong></td>
                            <td><span className="quantity">{e.cantidad} unidades</span></td>
                            <td>{e.factura}</td>
                            <td>{e.stand}</td>
                            <td>{e.ubicacion}</td>
                            <td>{e.fecha}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {entradas.length === 0 && <div className="empty">No hay entradas registradas.</div>}
                  </div>
                </section>
              </>
            )}
          </>
        )}

        <footer className="footer">
          StockFlow · Sistema de gestión de inventario · ORM
        </footer>

      </main>
    </div>
  );
}

export default App;
