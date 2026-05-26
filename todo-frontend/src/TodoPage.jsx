import { useState, useEffect, useRef } from 'react';
import { getTodos, createTodo, updateTodo, deleteTodo } from './api';

function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [editing, setEditing]   = useState(false);
  const [editText, setEditText] = useState(todo.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleEditSubmit = () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      setEditText(todo.title);
      setEditing(false);
      return;
    }
    if (trimmed !== todo.title) {
      onEdit(todo.id, trimmed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter')  handleEditSubmit();
    if (e.key === 'Escape') {
      setEditText(todo.title);
      setEditing(false);
    }
  };

  return (
    <div style={{
      ...styles.todoItem,
      opacity: todo.completed ? 0.65 : 1,
      borderLeft: todo.completed ? '3px solid #86efac' : '3px solid #3b82f6',
    }}>
      <input
        type="checkbox"
        checked={!!todo.completed}
        onChange={() => onToggle(todo)}
        style={styles.checkbox}
      />
      {editing ? (
        <input
          ref={inputRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEditSubmit}
          onKeyDown={handleKeyDown}
          style={styles.editInput}
        />
      ) : (
        <span
          style={{
            ...styles.todoTitle,
            textDecoration: todo.completed ? 'line-through' : 'none',
            color: todo.completed ? '#9ca3af' : '#1f2937',
          }}
          onDoubleClick={() => !todo.completed && setEditing(true)}
          title={todo.completed ? '' : 'Double-click to edit'}
        >
          {todo.title}
        </span>
      )}
      <div style={styles.actions}>
        {!todo.completed && !editing && (
          <button onClick={() => setEditing(true)} style={styles.editBtn}>✏️</button>
        )}
        <button onClick={() => onDelete(todo.id)} style={styles.deleteBtn}>🗑️</button>
      </div>
    </div>
  );
}

function TodoPage({ user, onLogout }) {
  const [todos, setTodos]       = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [filter, setFilter]     = useState('all');
  const [loading, setLoading]   = useState(true);
  const [adding, setAdding]     = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => { loadTodos(); }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const response = await getTodos();
      setTodos(response.data);
    } catch {
      setError('Failed to load todos. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const response = await createTodo(newTitle.trim());
      setTodos([response.data, ...todos]);
      setNewTitle('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add todo');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (todo) => {
    try {
      const response = await updateTodo(todo.id, { completed: !todo.completed });
      setTodos(todos.map(t => t.id === todo.id ? response.data : t));
    } catch {
      setError('Failed to update todo');
    }
  };

  const handleEdit = async (id, newTitle) => {
    try {
      const response = await updateTodo(id, { title: newTitle });
      setTodos(todos.map(t => t.id === id ? response.data : t));
    } catch {
      setError('Failed to edit todo');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(t => t.id !== id));
    } catch {
      setError('Failed to delete todo');
    }
  };

  const handleClearCompleted = async () => {
    const completed = todos.filter(t => t.completed);
    try {
      await Promise.all(completed.map(t => deleteTodo(t.id)));
      setTodos(todos.filter(t => !t.completed));
    } catch {
      setError('Failed to clear completed todos');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  const filteredTodos  = todos.filter(todo => {
    if (filter === 'active')    return !todo.completed;
    if (filter === 'completed') return  todo.completed;
    return true;
  });

  const activeCount    = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t =>  t.completed).length;

  return (
    <div style={styles.container}>
      <div style={styles.app}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📝 Todos</h1>
            <p style={styles.subtitle}>Built with React + Node.js + Oracle Cloud</p>
          </div>
          <div style={styles.userSection}>
            <span style={styles.userEmail}>{user.email}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            ❌ {error}
            <button onClick={() => setError('')} style={styles.errorClose}>✕</button>
          </div>
        )}

        <form onSubmit={handleAdd} style={styles.addForm}>
          <input
            type="text"
            placeholder="What needs to be done? Press Enter to add."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={styles.addInput}
            autoFocus
          />
          <button
            type="submit"
            disabled={adding || !newTitle.trim()}
            style={styles.addButton}
          >
            {adding ? '...' : '+ Add'}
          </button>
        </form>

        <div style={styles.filterBar}>
          <span style={styles.countText}>{activeCount} left</span>
          <div style={styles.filters}>
            {['all', 'active', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...styles.filterBtn,
                  ...(filter === f ? styles.filterBtnActive : {}),
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {completedCount > 0 && (
            <button onClick={handleClearCompleted} style={styles.clearBtn}>
              Clear {completedCount} done
            </button>
          )}
        </div>

        <div style={styles.list}>
          {loading ? (
            <div style={styles.centerMsg}>⏳ Loading your todos...</div>
          ) : filteredTodos.length === 0 ? (
            <div style={styles.centerMsg}>
              {filter === 'all' ? '✨ No todos yet. Add one above!'
                : filter === 'active' ? '🎉 All caught up!'
                : '📭 No completed todos yet.'}
            </div>
          ) : (
            filteredTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>

        {todos.length > 0 && (
          <p style={styles.hint}>💡 Double-click a todo title to edit it</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px 16px', fontFamily: "'Segoe UI', Arial, sans-serif" },
  app: { maxWidth: '620px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  title: { fontSize: '2rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  subtitle: { fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0' },
  userSection: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
  userEmail: { fontSize: '0.8rem', color: '#64748b' },
  logoutBtn: { padding: '5px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },
  errorBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' },
  errorClose: { background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  addForm: { display: 'flex', gap: '8px', marginBottom: '12px' },
  addInput: { flex: 1, padding: '13px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem', outline: 'none' },
  addButton: { padding: '13px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', whiteSpace: 'nowrap' },
  filterBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'white', borderRadius: '10px', marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: '8px' },
  countText: { fontSize: '0.85rem', color: '#64748b', fontWeight: '500' },
  filters: { display: 'flex', gap: '4px' },
  filterBtn: { padding: '4px 12px', border: '1px solid transparent', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent', fontSize: '0.85rem', color: '#64748b' },
  filterBtnActive: { borderColor: '#3b82f6', color: '#3b82f6', backgroundColor: '#eff6ff', fontWeight: '600' },
  clearBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#94a3b8' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  centerMsg: { textAlign: 'center', color: '#94a3b8', padding: '48px 20px', fontSize: '0.95rem', backgroundColor: 'white', borderRadius: '10px' },
  todoItem: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', padding: '14px 16px', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6', flexShrink: 0 },
  todoTitle: { flex: 1, fontSize: '0.95rem', cursor: 'text', wordBreak: 'break-word' },
  editInput: { flex: 1, padding: '4px 8px', border: '2px solid #3b82f6', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' },
  actions: { display: 'flex', gap: '4px', flexShrink: 0 },
  editBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: '4px 6px', borderRadius: '4px', opacity: 0.6 },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: '4px 6px', borderRadius: '4px', opacity: 0.6 },
  hint: { textAlign: 'center', color: '#cbd5e1', fontSize: '0.78rem', marginTop: '16px' },
};

export default TodoPage;