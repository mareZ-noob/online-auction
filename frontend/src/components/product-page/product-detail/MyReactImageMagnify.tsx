import { createPortal } from "react-dom";
import { useState, useEffect, useRef } from "react";

const MyReactImageMagnify = ({
	imageObj,
}: {
	imageObj: { url: string; alt: string };
}) => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const imgRef = useRef<HTMLImageElement | null>(null);
	const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
	const [visible, setVisible] = useState(false);
	const [pos, setPos] = useState({ x: 0, y: 0 });

	// magnifier pane size (px)
	const MAG_WIDTH = 320;
	const MAG_HEIGHT = 320;

	useEffect(() => {
		if (!imageObj?.url) return;
		const img = new Image();
		img.src = imageObj.url;
		const onload = () =>
			setNatural({ w: img.naturalWidth, h: img.naturalHeight });
		if (img.complete) onload();
		else img.addEventListener("load", onload);
		return () => img.removeEventListener("load", onload);
	}, [imageObj]);

	// portal element for magnified pane
	const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
	useEffect(() => {
		const el = document.createElement("div");
		el.style.position = "fixed";
		el.style.zIndex = "9999";
		document.body.appendChild(el);
		setPortalEl(el);
		return () => {
			document.body.removeChild(el);
		};
	}, []);

	const onMove = (e: React.MouseEvent) => {
		const imgEl = imgRef.current;
		if (!imgEl) return;
		const rect = imgEl.getBoundingClientRect();
		const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
		const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
		setPos({ x, y });
	};

	const onLeave = () => setVisible(false);
	const onEnter = () => setVisible(true);

	// compute lens size in small-image coordinates
	const lens = (() => {
		if (!natural || !imgRef.current) return { w: 0, h: 0 };
		const imgRect = imgRef.current.getBoundingClientRect();
		const ratioX = natural.w / imgRect.width;
		const ratioY = natural.h / imgRect.height;
		const lw = MAG_WIDTH / ratioX;
		const lh = MAG_HEIGHT / ratioY;
		return { w: lw, h: lh };
	})();

	// background position for magnifier (px)
	const bgPos = (() => {
		if (!natural || !imgRef.current) return { x: 0, y: 0 };
		const imgRect = imgRef.current.getBoundingClientRect();
		const ratioX = natural.w / imgRect.width;
		const ratioY = natural.h / imgRect.height;
		const bgX = pos.x * ratioX - MAG_WIDTH / 2;
		const bgY = pos.y * ratioY - MAG_HEIGHT / 2;
		return { x: -bgX, y: -bgY };
	})();

	// compute lens position relative to wrapper (so it follows the mouse precisely)
	const lensPosition = (() => {
		if (!imgRef.current || !wrapperRef.current) return { left: 0, top: 0 };
		const imgRect = imgRef.current.getBoundingClientRect();
		const wrapRect = wrapperRef.current.getBoundingClientRect();
		const offsetLeft = imgRect.left - wrapRect.left;
		const offsetTop = imgRect.top - wrapRect.top;
		const left = offsetLeft + pos.x - lens.w / 2;
		const top = offsetTop + pos.y - lens.h / 2;
		return { left, top };
	})();

	// portal style: position over the info column (to the right of the gallery)
	const portalStyle = (() => {
		if (!portalEl || !containerRef.current) return { left: 0, top: 0 };
		const rect = containerRef.current.getBoundingClientRect();
		// position the pane so it overlaps the info column to the right
		const left = Math.min(window.innerWidth - MAG_WIDTH - 8, rect.right + 8);
		const top = Math.max(8, rect.top + 8);
		return { left, top };
	})();

	return (
		<div
			ref={containerRef}
			className="w-full h-full flex items-center justify-center bg-white"
			style={{ padding: 12 }}
		>
			<div className="flex w-full h-full" style={{ gap: 12 }}>
				{/* small image area */}
				<div
					className="relative flex-1 flex items-center justify-center"
					ref={wrapperRef}
					onMouseMove={onMove}
					onMouseLeave={onLeave}
					onMouseEnter={onEnter}
				>
					<img
						ref={imgRef}
						src={imageObj.url}
						alt={imageObj.alt}
						className="max-w-full max-h-full object-contain"
						style={{ display: "block", maxHeight: "100%", maxWidth: "100%" }}
					/>

					{/* lens */}
					{visible && lens.w > 0 && (
						<div
							style={{
								position: "absolute",
								pointerEvents: "none",
								left: `${Math.max(0, lensPosition.left)}px`,
								top: `${Math.max(0, lensPosition.top)}px`,
								width: `${lens.w}px`,
								height: `${lens.h}px`,
								border: "2px solid rgba(255,255,255,0.9)",
								boxShadow: "0 0 0 9999px rgba(0,0,0,0.25)",
							}}
						/>
					)}
				</div>
				{/* magnified pane is rendered into a portal so it can overlay the info area */}
				{portalEl && visible && natural
					? createPortal(
							<div
								style={{
									position: "fixed",
									left: `${portalStyle.left}px`,
									top: `${portalStyle.top}px`,
									width: MAG_WIDTH,
									height: MAG_HEIGHT,
									border: "1px solid #e5e7eb",
									background: "#fff",
									boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
									overflow: "hidden",
								}}
							>
								<div
									style={{
										width: "100%",
										height: "100%",
										backgroundImage: `url(${imageObj.url})`,
										backgroundRepeat: "no-repeat",
										backgroundSize: `${natural.w}px ${natural.h}px`,
										backgroundPosition: `${bgPos.x}px ${bgPos.y}px`,
									}}
								/>
							</div>,
							portalEl,
						)
					: null}
			</div>
		</div>
	);
};

export default MyReactImageMagnify;
