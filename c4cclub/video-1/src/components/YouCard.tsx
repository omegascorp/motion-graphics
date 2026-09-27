import React from 'react';
import {interpolate} from 'remotion';
import {CONFIG} from '../config';
import {MONO, SANS} from '../fonts';
import {alpha} from '../motion';
import {brandFill, brandGlow} from '../style';
import {BrowserCard} from './BrowserCard';
import {SiteIcon} from './SiteIcon';

const B = CONFIG.brand;
const Y = CONFIG.yourApp;

/**
 * The centre card: a gradient-rimmed, glowing browser window that starts empty,
 * gets populated in step 1 and carries the host snippet from step 3.
 */
export const YouCard: React.FC<{w: number; h: number; pulse: number; populate: number; snippet: number}> = ({
	w,
	h,
	pulse,
	populate,
	snippet,
}) => {
	const pop = Math.min(1, populate);
	const snip = Math.min(1, snippet);
	return (
		<div style={{position: 'relative'}}>
			{/* Soft brand halo behind the card */}
			<div
				style={{
					position: 'absolute',
					inset: -40,
					borderRadius: 60,
					background: `radial-gradient(ellipse at center, ${alpha(B.violet, 0.35 + 0.35 * pulse)} 0%, transparent 70%)`,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: -42,
					transform: 'translateX(-50%)',
					padding: '6px 14px',
					borderRadius: 999,
					background: brandFill(),
					boxShadow: `0 0 20px ${alpha(B.blue, 0.6)}, inset 0 1px 0 ${alpha('#FFFFFF', 0.25)}`,
					color: '#FFFFFF',
					fontFamily: SANS,
					fontWeight: 700,
					fontSize: 16,
					whiteSpace: 'nowrap',
				}}
			>
				{Y.label}
			</div>
			{/* Gradient rim: the card sits 2px inside a brand-gradient plate */}
			<div style={{padding: 2, borderRadius: 18, background: brandGlow(), position: 'relative'}}>
				<BrowserCard
					w={w - 4}
					h={h - 4}
					borderColor="transparent"
					glow={0.4 + 0.6 * pulse}
					glowColor={B.blue}
					domain={<span style={{opacity: pop}}>{Y.domain}</span>}
					icon={
						<div style={{width: 52, height: 52, position: 'relative'}}>
							<div
								style={{
									position: 'absolute',
									width: 52,
									height: 52,
									borderRadius: 13,
									border: `2px dashed ${B.lineHi}`,
									opacity: 1 - pop,
								}}
							/>
							<div style={{transform: `scale(${interpolate(populate, [0, 1], [0.5, 1])})`, opacity: pop}}>
								<SiteIcon id="you" size={52} />
							</div>
						</div>
					}
					name={
						<span style={{display: 'inline-block', opacity: pop, transform: `translateX(${(1 - populate) * -12}px)`}}>
							{Y.name}
						</span>
					}
					footer={
						<div style={{height: 32, padding: '0 10px 10px', overflow: 'visible'}}>
							<div
								style={{
									height: 22,
									borderRadius: 6,
									background: alpha(B.black, 0.7),
									border: `1px solid ${alpha(B.pop, 0.35)}`,
									color: B.pop,
									fontFamily: MONO,
									fontSize: 11,
									display: 'flex',
									alignItems: 'center',
									padding: '0 8px',
									whiteSpace: 'nowrap',
									opacity: snip,
									transform: `translateX(${(1 - snippet) * -260}px)`,
								}}
							>
								{Y.snippet}
							</div>
						</div>
					}
				/>
			</div>
		</div>
	);
};
