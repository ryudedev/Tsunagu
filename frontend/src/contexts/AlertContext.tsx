'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AlertState, AlertType } from '@/types/alert';
import Alert from '@/components/Alert';
import { AnimatePresence } from 'framer-motion';

interface AlertContextType {
  showAlert: (title: string, description: string | undefined, type: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

/**
 * Alertを表示するためのProviderを提供します。
 * 
 * @remarks
 * Alertを表示し、10sで自動削除されます。または、xを押下すると削除するとことができます。
 * 複数アラートは表示することが出来ます。
 * 
 * @param 
 * - children: コンテンツの表示内容を引数として受け取る
 * 
 * @returns 
 * メインコンテンツとアラートを表示するためのJSX.Element
 */
export function AlertProvider({ children }: { children: ReactNode }) {
  /** アラートの情報を配列として保持するstate */
  const [alerts, setAlerts] = useState<AlertState[]>([]);

  /** 
   * アラートを手動で削除するコールバック関数
   * 
   * @remarks
   * 削除対象アラートをstateから削除するためにfilterをかけ削除する
   * 
   * @parma
   * - id: 削除対象のidを指定する
   */
  const closeAlert = useCallback((id: number) => {
    setAlerts((currentAlerts) => currentAlerts.filter((alert) => alert.id !== id));
  }, []);

  /**
   * アラートを表示・自動削除するコールバック関数
   * 
   * @remarks
   * 各種引数を受け付け、`alerts` stateに追加し、10sカウントし自動で削除する。
   * 
   * @param
   * - title: アラートのタイトル
   * - description: アラートの詳細説明
   * - type: アラートの種類(例: error)
   */
  const showAlert = useCallback((title: string, description: string | undefined, type: AlertType) => {
    const id = Date.now(); 
    
    setAlerts((currentAlerts) => [...currentAlerts, { id, title, description, type }]);

    setTimeout(() => {
      closeAlert(id);
    }, 10000);
  }, [closeAlert]);
  
  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
        <AnimatePresence>
          {alerts.map((alert) => (
            <Alert key={alert.id} alert={alert} onClose={closeAlert} />
          ))}
        </AnimatePresence>
      </div>
    </AlertContext.Provider>
  );
}

/**
 * AlertContextにアクセスし、アラート表示機能を提供するためのカスタムフックです。
 *
 * @remarks
 * このフックは`AlertProvider`でラップされたコンポーネント内でのみ使用可能です。
 * Providerの外側で呼び出された場合、実行時エラーがスローされます。
 *
 * @returns アラートを表示するための`showAlert`関数を含むオブジェクト。
 */
export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};