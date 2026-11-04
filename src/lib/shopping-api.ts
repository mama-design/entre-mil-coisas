import {supabase} from './supabase';

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: string;
  purchased: boolean;
};

const fields = 'id,name,quantity,purchased';
const shopping = () => supabase.from('emc_shopping_items');

export async function loadShopping() {
  const {data, error} = await shopping().select(fields).order('created_at').order('id');
  if (error) throw Error('Não consegui abrir tua lista.');
  return data as ShoppingItem[];
}

export async function saveShopping(values: Pick<ShoppingItem, 'name' | 'quantity'>, id?: string) {
  const request = id ? shopping().update(values).eq('id', id) : shopping().insert(values);
  const {data, error} = await request.select(fields).single();
  if (error) throw Error('Não consegui salvar o item. Tenta novamente.');
  return data as ShoppingItem;
}

export async function markShopping(id: string, purchased: boolean) {
  const {data, error} = await shopping().update({purchased}).eq('id', id).select(fields).single();
  if (error) throw Error('Não consegui atualizar o item. Tenta novamente.');
  return data as ShoppingItem;
}

export async function removeShopping(id: string) {
  const {error} = await shopping().delete().eq('id', id).select('id').single();
  if (error) throw Error('Não consegui remover o item. Tenta novamente.');
}
