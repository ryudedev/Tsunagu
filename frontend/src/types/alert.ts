/**
 * アラートの種類を定義します。
 * 今後 'success' | 'info' | 'warning' などを追加できます。
 */
export type AlertType = 'error';

/**
 * 単一のアラートが持つ状態を定義します。
 */
export interface AlertState {
  id: number;
  title: string;
  description?: string;
  type: AlertType;
}