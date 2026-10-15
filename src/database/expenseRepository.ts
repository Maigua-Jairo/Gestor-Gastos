import { SQLiteDatabase } from 'expo-sqlite';
import { Category, Expense } from '@/types/expense';

interface ExpenseRow {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string | null;
  receipt_uri: string | null;
}

function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    amount: row.amount,
    category: row.category as Category,
    date: new Date(row.date),
    description: row.description ?? undefined,
    receiptUri: row.receipt_uri ?? undefined,
  };
}

export async function getAllExpenses(db: SQLiteDatabase): Promise<Expense[]> {
  const rows = await db.getAllAsync<ExpenseRow>(
    'SELECT id, amount, category, date, description, receipt_uri FROM expenses ORDER BY date DESC'
  );
  return rows.map(rowToExpense);
}

export async function insertExpense(db: SQLiteDatabase, expense: Expense): Promise<void> {
  await db.runAsync(
    'INSERT INTO expenses (id, amount, category, date, description, receipt_uri) VALUES (?, ?, ?, ?, ?, ?)',
    expense.id,
    expense.amount,
    expense.category,
    expense.date.toISOString(),
    expense.description ?? null,
    expense.receiptUri ?? null
  );
  
}

// Elimina un gasto de la base de datos por su ID
export async function deleteExpense(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM expenses WHERE id = ?', id);
}
// Actualiza un gasto existente en la base de datos (la fecha NO se cambia)
export async function updateExpense(db: SQLiteDatabase, expense: Expense): Promise<void> {
  await db.runAsync(
    'UPDATE expenses SET amount = ?, category = ?, description = ?, receipt_uri = ? WHERE id = ?',
    expense.amount,
    expense.category,
    expense.description ?? null,
    expense.receiptUri ?? null,
    expense.id
  );
}