'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Modal from '@/components/Modal';

/**
 * ModalContextが提供する値の型定義です。
 */
interface ModalContextType {
  showModal: (content: ReactNode) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

/**
 * アプリケーション全体にモーダル機能を提供するProviderです。
 *
 * @remarks
 * このProviderは、`useModal`フックを通じて、どのコンポーネントからでもモーダルを
 * 表示・非表示にするための関数を提供します。
 * モーダルが表示されると、背景はダークオーバーレイで覆われます。
 *
 * @param
 * - children: Providerでラップする子コンポーネント
 *
 * @returns
 * 子コンポーネントと、モーダル表示を管理するロジックを含むReact要素
 */
export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);

  /**
   * モーダルを表示するためのコールバック関数です。
   *
   * @remarks
   * この関数に渡されたReact要素（JSX）がモーダルの内容として表示されます。
   *
   * @param
   * - content: モーダル内に表示するReact要素
   *
   * @returns
   * なし (void)
   */
  const showModal = useCallback((content: ReactNode) => {
    setModalContent(content);
  }, []);

  /**
   * 表示されているモーダルを閉じるためのコールバック関数です。
   *
   * @remarks
   * 背景のオーバーレイをクリックするか、モーダル内の閉じるボタンから呼び出されます。
   *
   * @returns
   * なし (void)
   */
  const hideModal = useCallback(() => {
    setModalContent(null);
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <Modal isVisible={!!modalContent} onClose={hideModal}>
        {modalContent}
      </Modal>
    </ModalContext.Provider>
  );
}

/**
 * モーダル表示機能をコンポーネントから簡単に利用するためのカスタムフックです。
 *
 * @remarks
 * このフックは、必ず`ModalProvider`でラップされたコンポーネントツリーの内側で使用する必要があります。
 * Providerの外部で呼び出すと、実行時エラーがスローされます。
 *
 * @returns
 * `showModal`と`hideModal`の2つの関数を含むオブジェクト
 */
export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};