import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconGlassCocktail = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-glass-cocktail" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M8 21h8M12 15v6M5 5a7 2 0 1 0 14 0A7 2 0 1 0 5 5" /><path d="M5 5v.388c0 .432.126.853.362 1.206l5 7.509c.633.951 1.88 1.183 2.785.517.191-.141.358-.316.491-.517l5-7.509c.236-.353.362-.774.362-1.206V5" /></svg>;
const Memo = memo(IconGlassCocktail);
export default Memo;