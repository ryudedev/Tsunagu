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
}

/**
 * モーダルのUI（見た目）を提供するコンポーネントです。
 *
 * @remarks
 * `framer-motion`を使用し、背景のフェードインとコンテンツのポップアップアニメーションを実装しています。
 * 背景のオーバーレイをクリックするか、右上の閉じるボタンでモーダルを閉じることができます。
 *
 * @param
 * - isVisible: モーダルの表示・非表示を制御する真偽値
 * - onClose: モーダルを閉じる際に呼び出されるコールバック関数
 * - children: モーダルの本体に表示されるコンテンツ
 *
 * @returns
 * isVisibleがtrueの場合に、アニメーション付きのモーダルUIのJSX.Elementを返却します。
 */
export default function Modal({ isVisible, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* 背景のオーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* モーダルのコンテンツコンテナ */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 m-auto w-full max-w-md h-fit bg-white rounded-lg shadow-lg p-6"
          >
            {/* 右上の閉じるボタン */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              aria-label="Close modal"
            >
              <Icon.Close className="w-6 h-6" />
            </button>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}