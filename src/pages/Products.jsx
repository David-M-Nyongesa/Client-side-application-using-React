import { useEffect, useState } from "react";
import APIClient from "../api/APIClient";
import { useAuth } from "../context/AuthContext";

const emptyForm = { name: "", price: "", stock: "" };

export default function Products() {
  const { user, signOut } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    APIClient.get("/products")
      .then(setProducts)
      .catch((err) => handleError(err, "Couldn't load products. Is the API running?"))
      .finally(() => setLoading(false));
  }, []);

  function handleError(err, message) {
    if (err.status === 401) signOut();
    else setError(message);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim()) return setError("Give the product a name.");
    if (form.price === "" || price < 0) return setError("Enter a price of 0 or more.");
    if (form.stock === "" || !Number.isInteger(stock) || stock < 0) {
      return setError("Stock must be a whole number.");
    }

    const data = { name: form.name.trim(), price, stock };

    try {
      if (editingId) {
        const updated = await APIClient.patch(`/products/${editingId}`, data);
        setProducts(products.map((p) => (p.id === editingId ? updated : p)));
      } else {
        const created = await APIClient.post("/products", data);
        setProducts([...products, created]);
      }
      resetForm();
    } catch (err) {
      handleError(err, "Couldn't save the product. Try again.");
    }
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({ name: product.name, price: String(product.price), stock: String(product.stock) });
    setError("");
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    try {
      await APIClient.delete(`/products/${product.id}`);
      setProducts(products.filter((p) => p.id !== product.id));
      if (editingId === product.id) resetForm();
    } catch (err) {
      handleError(err, "Couldn't delete the product. Try again.");
    }
  }

  return (
    <div>
      <header className="bar">
        <strong>Duka Stock</strong>
        <span className="muted">{user.email}</span>
        <button className="btn" onClick={signOut}>Sign out</button>
      </header>

      <main className="layout">
        <section>
          <h2>Products <span className="count">{products.length}</span></h2>

          {loading && <p className="muted">Loading products…</p>}
          {!loading && products.length === 0 && (
            <p className="muted">Nothing on the shelf yet. Add your first product.</p>
          )}

          <ul className="list">
            {products.map((product) => (
              <li key={product.id} className={product.id === editingId ? "row editing" : "row"}>
                <div>
                  <div className="name">{product.name}</div>
                  <div className="muted">
                    {product.stock} in stock
                    {product.user_id != null &&
                      `, added by ${product.user_id === user.id ? "you" : `user ${product.user_id}`}`}
                  </div>
                </div>
                <div className="price">KES {product.price.toLocaleString()}</div>
                <div className="actions">
                  <button className="btn" onClick={() => startEdit(product)}>Edit</button>
                  <button className="btn danger" onClick={() => handleDelete(product)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <form className="panel" onSubmit={handleSubmit} noValidate>
          <h2>{editingId ? "Edit product" : "Add product"}</h2>
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label>
            Price (KES)
            <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </label>
          <label>
            Stock
            <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </label>
          {error && <p className="error">{error}</p>}
          <div className="actions">
            <button className="btn primary" type="submit">
              {editingId ? "Save changes" : "Add product"}
            </button>
            {editingId && <button className="btn" type="button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </main>
    </div>
  );
}
