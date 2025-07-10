'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import Icon from './Icon';

/**
 * ModalコンポーネントのPropsの型定義です。
 */
interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
}

/**
 * モーダルのUI（見た目）を提供するコンポーネントです。
 *
 * @remarks
 * `framer-motion`を使用し、背景のフェードインとコンテンツのポップアップアニメーションを実装しています。
 * 確定ボタンは`confirmText`が指定された場合のみ表示されます。
 *
 * @param
 * - isVisible: モーダルの表示・非表示を制御する真偽値
 * - onClose: モーダルを閉じる際に呼び出されるコールバック関数
 * - children: モーダルの本体に表示されるコンテンツ
 * - confirmText: 確定ボタンに表示するテキスト
 * - onConfirm: 確定ボタンが押された際に実行されるコールバック関数
 *
 * @returns
 * isVisibleがtrueの場合に、アニメーション付きのモーダルUIのJSX.Elementを返却します。
 */
export default function Modal({ isVisible, onClose, children, confirmText, onConfirm }: ModalProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 m-auto w-full max-w-md h-fit bg-white rounded-4xl shadow-lg p-6 flex flex-col"
          >
            <div className='flex-grow'>
              {children}
            </div>

            {/* --- ここから下が修正箇所 --- */}
            <div className="flex justify-end items-center mt-6 space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-2xl hover:bg-gray-200 text-gray-800"
              >
                キャンセル
              </button>

              {confirmText && onConfirm && (
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-2xl bg-logo text-white"
                >
                  {confirmText}
                </button>
              )}
            </div>
            {/* --- ここまでが修正箇所 --- */}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}