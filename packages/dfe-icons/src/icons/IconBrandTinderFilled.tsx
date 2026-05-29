import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandTinderFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-brand-tinder" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M11.595 2.13a1 1 0 0 1 1.455-1.016c3.11 1.625 5.41 3.797 6.77 6.627l-.013-.024.01.019.115.232c2.751 5.7.088 12.587-5.913 13.76l-.267.049c-8.719 1.91-14.455-8.74-7.97-14.918.466-.46 1.28-1.196 1.636-1.45A1 1 0 0 1 9 6.222c0 .311.086 1.117.205 1.694q.046.215.093.383l.017.058.1-.02c1.562-.396 2.522-3.021 2.21-5.955z" /></svg>;
const Memo = memo(IconBrandTinderFilled);
export default Memo;