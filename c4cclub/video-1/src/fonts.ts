// Brand font placeholder: DM Sans. To change it, swap the import below for
// any family under @remotion/google-fonts/<Family>.
import {loadFont as loadSans} from '@remotion/google-fonts/DMSans';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

export const {fontFamily: SANS} = loadSans('normal', {weights: ['400', '500', '700'], subsets: ['latin']});
export const {fontFamily: MONO} = loadMono('normal', {weights: ['400', '500'], subsets: ['latin']});
