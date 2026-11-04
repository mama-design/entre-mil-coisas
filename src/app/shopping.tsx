import {useEffect, useRef, useState, type FormEvent} from 'react';
import {ArrowLeft, ArrowRight, Check, Pencil, Plus, ShoppingBasket} from 'lucide-react';
import {loadShopping, markShopping, removeShopping, saveShopping, type ShoppingItem} from '../lib/shopping-api';
import './shopping.css';

export default function Shopping() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<ShoppingItem | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const pending = items.filter(item => !item.purchased);
  const purchased = items.filter(item => item.purchased);
  const count = pending.length === 1 ? '1 item pendente' : `${pending.length} itens pendentes`;

  async function load() {
    setLoading(true);
    setLoadError('');
    try {
      setItems(await loadShopping());
    } catch (err) {
      setLoadError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);
  useEffect(() => { if (draft) input.current?.focus(); }, [draft?.id]);

  function edit(item?: ShoppingItem) {
    setError('');
    setConfirmRemove(false);
    setDraft(item ?? {id: '', name: '', quantity: '', purchased: false});
  }

  async function change(operation: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await operation();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function replace(item: ShoppingItem) {
    setItems(previous => previous.map(row => row.id === item.id ? item : row));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft?.name.trim()) {
      setError('Escreve o nome do item.');
      return;
    }
    void change(async () => {
      const saved = await saveShopping({name: draft.name.trim(), quantity: draft.quantity.trim()}, draft.id || undefined);
      if (draft.id) replace(saved);
      else setItems(previous => [...previous, saved]);
      setDraft(null);
    });
  }

  function rows(group: ShoppingItem[]) {
    return group.map(item => (
      <div className={'shopping-row' + (item.purchased ? ' bought' : '')} key={item.id}>
        <button type="button" className="shopping-check" aria-pressed={item.purchased}
          aria-label={(item.purchased ? 'Desmarcar ' : 'Marcar como comprado: ') + item.name}
          disabled={busy} onClick={() => void change(async () => replace(await markShopping(item.id, !item.purchased)))}>
          <span>{item.purchased && <Check size={16}/>}</span>
        </button>
        <p><strong>{item.name}</strong>{item.quantity && <small> · {item.quantity}</small>}</p>
        <button type="button" className="shopping-edit" aria-label={'Editar ' + item.name} disabled={busy} onClick={() => edit(item)}><Pencil size={18}/></button>
      </div>
    ));
  }

  return <>
    <button type="button" className="shopping-card" onClick={() => dialog.current?.showModal()}>
      <ShoppingBasket size={29} aria-hidden="true"/>
      <span><strong>Lista de compras</strong><small>{loading ? 'Carregando…' : loadError ? 'Abrir lista' : pending.length ? count : 'Nenhum item pendente'}</small></span>
      <ArrowRight size={22} aria-hidden="true"/>
    </button>
    <dialog ref={dialog} className="shopping-dialog" aria-labelledby="shopping-title"
      onCancel={event => { if (busy) event.preventDefault(); }}
      onClose={() => { setDraft(null); setError(''); setConfirmRemove(false); }}>
      <div className="shopping-page">
        <button type="button" className="shopping-back" disabled={busy} onClick={() => dialog.current?.close()}><ArrowLeft size={19}/> Meu dia</button>
        <header className="shopping-heading">
          <ShoppingBasket size={42} strokeWidth={1.6} aria-hidden="true"/>
          <div><h2 id="shopping-title">Lista de compras</h2><p aria-live="polite">{!loading && !loadError && count}</p></div>
        </header>
        {loading && <p role="status">Carregando tua lista…</p>}
        {loadError && <p role="alert">{loadError} <button type="button" onClick={() => void load()}>Tentar novamente</button></p>}
        {!loading && !loadError && <>
          {draft ? <form className="shopping-form" onSubmit={submit}>
            <h3>{draft.id ? 'Editar item' : 'Novo item'}</h3>
            <label>Item<input ref={input} value={draft.name} required maxLength={120} disabled={busy} onChange={event => setDraft({...draft, name: event.target.value})}/></label>
            <label>Quantidade <small>(opcional)</small><input value={draft.quantity} placeholder="Ex.: 2 caixas" maxLength={60} disabled={busy} onChange={event => setDraft({...draft, quantity: event.target.value})}/></label>
            <div className="shopping-form-actions">
              <button type="submit" className="save" disabled={busy}>Salvar</button>
              <button type="button" disabled={busy} onClick={() => {setDraft(null); setError('');}}>Cancelar</button>
            </div>
            {draft.id && (confirmRemove
              ? <button type="button" className="shopping-remove" disabled={busy} onClick={() => void change(async () => {
                await removeShopping(draft.id);
                setItems(previous => previous.filter(row => row.id !== draft.id));
                setDraft(null);
                setConfirmRemove(false);
              })}>Confirmar remoção</button>
              : <button type="button" className="shopping-remove" disabled={busy} onClick={() => setConfirmRemove(true)}>Remover item</button>)}
          </form> : <button type="button" className="save shopping-add" disabled={busy} onClick={() => edit()}><Plus size={21}/> Adicionar item</button>}
          {error && <p className="error" role="alert">{error}</p>}
          <section className="shopping-group"><div className="section-title"><h3>Pendentes</h3></div>
            {pending.length ? rows(pending) : <p>{items.length ? 'Tudo comprado!' : 'Adiciona o primeiro item da tua lista.'}</p>}
          </section>
          {purchased.length > 0 && <section className="shopping-group shopping-completed"><div className="section-title"><h3>Comprados</h3></div>{rows(purchased)}</section>}
        </>}
      </div>
    </dialog>
  </>;
}
