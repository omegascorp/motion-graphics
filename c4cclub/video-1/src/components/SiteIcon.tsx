import React from 'react';
import {Img, staticFile} from 'remotion';
import {CONFIG} from '../config';
import {SANS} from '../fonts';
import {NodeId, NETWORK} from '../network/layout';
import {YourAppIcon} from './YourAppIcon';

/** Member icon (asset), monogram fallback, or the viewer's own app icon. */
export const SiteIcon: React.FC<{id: NodeId; size: number}> = ({id, size}) => {
	if (id === 'you') return <YourAppIcon size={size} />;
	const site = NETWORK.nodes[id].site!;
	const radius = size * 0.25;
	if (site.icon) {
		return (
			<Img
				src={staticFile(site.icon)}
				style={{width: size, height: size, borderRadius: radius, objectFit: 'cover', display: 'block'}}
			/>
		);
	}
	const mono = site as {monogram?: string; monogramColor?: string};
	return (
		<div
			style={{
				width: size,
				height: size,
				borderRadius: radius,
				background: mono.monogramColor,
				color: CONFIG.brand.text,
				fontFamily: SANS,
				fontWeight: 700,
				fontSize: size * 0.5,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			{mono.monogram}
		</div>
	);
};
