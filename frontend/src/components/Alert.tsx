'use client';

import { AlertState } from '@/types/alert';
import { motion } from 'framer-motion';
import Icon from '@/components/Icon';

interface AlertProps {
  alert: AlertState;
  onClose: (id: number) => void;
}

/**
 * アラートを表示するためのコンポーネント
 * 
 * @remarks
 * alert引数に基づいて表示内容を切り替える。
 * 10s経過後自動的に削除される。または、xボタンを押下すると削除するとができる。
 * 
 * @param 
 * - alert: アラートの表示情報
 * - onClose: アラートを閉じる関数
 * 
 * @returns アラートを表示するためのJSX.Element
 */
export default function Alert({ alert, onClose }: AlertProps) {
  const baseStyle = "w-auto max-w-md p-4 rounded-md shadow-lg flex items-start justify-between text-white text-sm";
  const typeStyles = {
    error: 'bg-red-600',
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      className={`${baseStyle} ${typeStyles[alert.type]}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <Icon.Error className="h-5 w-5" />
        </div>
        
        <div className="ml-3">
          <p className="font-bold">{alert.title}</p>
          {alert.description && (
            <p className="mt-1">{alert.description}</p>
          )}
        </div>
      </div>

      <div className="ml-4 flex-shrink-0">
        <button 
          onClick={() => onClose(alert.id)}
          className="p-1 rounded-full hover:bg-white/20"
          aria-label="Close"
        >
          <Icon.Close className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}