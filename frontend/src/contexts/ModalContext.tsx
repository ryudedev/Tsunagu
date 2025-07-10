'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Modal from '@/components/Modal';

/**
 * showModal関数に渡すオプションの型定義です。
 */
interface ModalOptions {
  confirmText?: string;
  onConfirm?: () => void;
}

/**
 * ModalContextが提供する値の型定義です。
 */
interface ModalContextType {
  showModal: (content: ReactNode, options?: ModalOptions) => void;
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
  /** モーダルのボタンなどのオプションを保持するstate */
  const [modalOptions, setModalOptions] = useState<ModalOptions | null>(null);

  /**
   * モーダルを表示するためのコールバック関数です。
   *
   * @remarks
   * 表示したいJSXと、オプションとして確定ボタンのテキストや動作を指定できます。
   *
   * @param
   * - content: モーダル内に表示するReact要素
   * - options: モーダルの設定（確定ボタンなど）
   *
   * @returns
   * なし (void)
   */
  const showModal = useCallback((content: ReactNode, options: ModalOptions = {}) => {
    setModalContent(content);
    setModalOptions(options);
  }, []);

  /**
   * 表示されているモーダルを閉じるためのコールバック関数です。
   *
   * @remarks
   * 背景のオーバーレイをクリックするか、モーダル内の閉じる/キャンセルボタンから呼び出されます。
   *
   * @returns
   * なし (void)
   */
  const hideModal = useCallback(() => {
    setModalContent(null);
    setModalOptions(null);
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <Modal 
        isVisible={!!modalContent} 
        onClose={hideModal}
        confirmText={modalOptions?.confirmText}
        onConfirm={modalOptions?.onConfirm}
      >
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