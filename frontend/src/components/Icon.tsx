'use client';

import React from 'react';

/**
 * アイコンコンポーネントの共通のProps
 * SVGは親要素の色を継承するようにcurrentColorを使用しているため、
 * classNameでtext-white, text-red-500などを指定して色を変更できます。
 */
interface SvgIconProps {
  className?: string;
}

/**
 * ベースとなるIconコンポーネントを定義
 * このコンポーネント自体は直接使わず、Icon.Errorのようにプロパティとして利用します。
 */
const Icon = () => {
  return null;
};

/**
 * エラーを示す「感嘆符付きの三角形」アイコン
 * 
 * @param
 * - className: css指定クラス
 * 
 * @example <Icon.Error />
 */
const ErrorIcon = ({ className }: SvgIconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="1em" 
    height="1em" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);


/**
 * 閉じるボタン用の「バツ印」アイコン
 * 
 * @param
 * - className: css指定クラス
 * 
 * @example <Icon.Close />
 */
const CloseIcon = ({ className }: SvgIconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="1em" 
    height="1em" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

/**
 * ローディング用の「loading」アイコン
 * 
 * @param
 * - className: css指定クラス
 * 
 * @example <Icon.Loading />
 */
const LoadingIcon = ({ className }: SvgIconProps) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap='round'
        strokeLinejoin='round'
        className={`animate-spin text-white ${className}`}
    >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
)

/**
 * baseコンポーネントに各種追加していく。
 */
Icon.Error = ErrorIcon;
Icon.Close = CloseIcon;
Icon.Loading = LoadingIcon;

export default Icon;