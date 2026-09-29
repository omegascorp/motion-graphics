// c4c.club type: Bricolage Grotesque for display, Figtree for text, JetBrains Mono for code.
import {loadFont as loadDisplay} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadSans} from '@remotion/google-fonts/Figtree';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

export const {fontFamily: DISPLAY} = loadDisplay('normal', {weights: ['600', '700', '800'], subsets: ['latin']});
export const {fontFamily: SANS} = loadSans('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']});
export const {fontFamily: MONO} = loadMono('normal', {weights: ['400', '500'], subsets: ['latin']});
