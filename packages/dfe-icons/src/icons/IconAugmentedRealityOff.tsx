import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconAugmentedRealityOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-augmented-reality-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M4 8V6c0-.557.228-1.061.595-1.424M4 16v2a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v2M16 20h2c.558 0 1.062-.228 1.425-.596M12 12.5l.312-.195m2.457-1.536L16 10M9.225 9.235 8 10l4 2.5V17l3.076-1.923M16 12v-2l-4-2.5-.302.189" /><path d="M8 10v4.5l4 2.5M3 3l18 18" /></svg>;
const Memo = memo(IconAugmentedRealityOff);
export default Memo;