'use client';

import React from 'react';
// react-iconsから使用するアイコンのコンポーネントをインポートします
import { FaExclamationTriangle } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { CgSpinner } from 'react-icons/cg';
import { FcGoogle } from 'react-icons/fc';

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
 * * @param
 * - className: css指定クラス
 * * @example <Icon.Error />
 */
const ErrorIcon = ({ className }: SvgIconProps) => (
  <FaExclamationTriangle className={className} />
);


/**
 * 閉じるボタン用の「バツ印」アイコン
 * * @param
 * - className: css指定クラス
 * * @example <Icon.Close />
 */
const CloseIcon = ({ className }: SvgIconProps) => (
  <IoMdClose className={className} />
);

/**
 * ローディング用の「loading」アイコン
 * * @param
 * - className: css指定クラス
 * * @example <Icon.Loading />
 */
const LoadingIcon = ({ className }: SvgIconProps) => (
  <CgSpinner className={`animate-spin ${className}`} />
);

// Googleアイコン用のコンポーネントを定義
const GoogleIcon = ({ className }: SvgIconProps) => (
  <FcGoogle className={className} />
);


/**
 * baseコンポーネントに各種追加していく。
 */
Icon.Error = ErrorIcon;
Icon.Close = CloseIcon;
Icon.Loading = LoadingIcon;
Icon.Google = GoogleIcon; // Googleアイコンもアタッチ

export default Icon;