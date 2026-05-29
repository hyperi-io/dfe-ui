import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBrandMeta = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-brand-meta" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12 10.174Q14.649 5.999 16.648 6c2 0 3.263 2.213 4 5.217.704 2.869.5 6.783-2 6.783-1.114 0-2.648-1.565-4.148-3.652a27.6 27.6 0 0 1-2.5-4.174M12 10.174Q9.351 5.999 7.352 6c-2 0-3.263 2.213-4 5.217-.704 2.869-.5 6.783 2 6.783C6.466 18 8 16.435 9.5 14.348q1.5-2.087 2.5-4.174" /></svg>;
const Memo = memo(IconBrandMeta);
export default Memo;