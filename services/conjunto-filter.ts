import { supabase } from './supabaseClient';

export function withConjuntoFilter<T extends Record<string, any>>(
  table: string,
  conjuntoId: string,
  options?: {
    select?: string;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }
) {
  let query = supabase
    .from(table)
    .select(options?.select || '*')
    .eq('conjunto_id', conjuntoId);

  if (options?.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? true,
    });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  return query;
}

export function withConjuntoInsert<T extends Record<string, any>>(
  table: string,
  data: T,
  conjuntoId: string
) {
  return supabase.from(table).insert({
    ...data,
    conjunto_id: conjuntoId,
  });
}

export function withConjuntoUpdate(
  table: string,
  data: Record<string, any>,
  conjuntoId: string,
  matchField: string,
  matchValue: string | number
) {
  return supabase
    .from(table)
    .update(data)
    .eq('conjunto_id', conjuntoId)
    .eq(matchField, matchValue);
}

export function withConjuntoDelete(
  table: string,
  conjuntoId: string,
  matchField: string,
  matchValue: string | number
) {
  return supabase
    .from(table)
    .delete()
    .eq('conjunto_id', conjuntoId)
    .eq(matchField, matchValue);
}
