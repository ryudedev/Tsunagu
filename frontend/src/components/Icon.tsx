'use client';

import React from 'react';
// react-iconsから使用するアイコンのコンポーネントをインポートします
import { FaExclamationTriangle, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { CgSpinner } from 'react-icons/cg';
import { FcGoogle } from 'react-icons/fc';

/**
 * アイコンコンポーネントの共通のProps
 * SVGは親要素の色を継承するようにcurrentColorを使用しているため、
 * classNameでtext-white, text-red-500などを指定して色を変更できます。
 */
interface SvgIconProps {
  size?: number;
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
const ErrorIcon = ({ className, size }: SvgIconProps) => (
  <FaExclamationTriangle className={className} size={size} />
);


/**
 * 閉じるボタン用の「バツ印」アイコン
 * * @param
 * - className: css指定クラス
 * * @example <Icon.Close />
 */
const CloseIcon = ({ className, size }: SvgIconProps) => (
  <IoMdClose className={className} size={size} />
);

/**
 * ローディング用の「loading」アイコン
 * * @param
 * - className: css指定クラス
 * * @example <Icon.Loading />
 */
const LoadingIcon = ({ className, size }: SvgIconProps) => (
  <CgSpinner className={`animate-spin ${className}`} size={size} />
);

/**
 * Google用の「google」アイコン
 * * @param
 * - className: css指定クラス
 * * @example <Icon.Google />
 */
const GoogleIcon = ({ className, size }: SvgIconProps) => (
  <FcGoogle className={className} size={size} />
);

/**
 * 検索用の「search」アイコン
 * * @param
 * - className: css指定クラス
 * * @example <Icon.Search />
 */
const SearchIcon = ({ className, size }: SvgIconProps) => (
  <FaSearch className={className} size={size} />
);

/**
 * サインアウト用の「signout」アイコン
 * * @param
 * - className: css指定クラス
 * * @example <Icon.Signout />
 */
const SignoutIcon = ({ className, size }: SvgIconProps) => (
  <FaSignOutAlt className={className} size={size} />
);


/**
 * baseコンポーネントに各種追加していく。
 */
Icon.Error = ErrorIcon;
Icon.Close = CloseIcon;
Icon.Loading = LoadingIcon;
Icon.Google = GoogleIcon;
Icon.Search = SearchIcon;
Icon.Signout = SignoutIcon;

export default Icon;