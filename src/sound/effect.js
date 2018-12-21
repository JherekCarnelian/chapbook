/*
Manages playing sound effects, which for now must be separately-hosted files. There
are two parts to playing a sound effect: defining it by name by creating
properties on `sound.effect`, and then playing it in a passage using an insert.
Defining the effect ahead of time allows it to be preloaded.

An example:

```
sound.effect.smash.url: "smash.mp3"
sound.effect.smash.description: "loud crash"
--
{sound effect: 'smash'}
```

See `../template/inserts/sound-effect.js` for the code that handles playing the
sound effect.
*/

import createLoggers from '../logger';
import event from '../event';
import {get} from '../state';

const {log} = createLoggers('sound');
let preloads = {};
const preloadEl = document.createElement('div');

preloadEl.setAttribute('hidden', true);

/* We don't use this attribute-- it's here for hacking purposes. */

preloadEl.dataset.cbAudioPreload = '';

function preload(name) {
	/*
	Create a DOM <audio> element for this effect if it doesn't already
	exist.
	*/

	if (!preloads[name]) {
		preloads[name] = document.createElement('audio');
		preloads[name].setAttribute('preload', 'auto');
		preloadEl.appendChild(preloads[name]);
		log(`Added new <audio> element to bank for "${name}"`);
	}

	preloads[name].setAttribute('src', get(`sound.effect.${name}.url`));
}

export function init() {
	document.body.appendChild(preloadEl);

	event.on('state-change', ({name}) => {
		/*
		If either `sound` or `sound.effect` was set wholesale, preload
		everything. This typically occurs when state is restored.
		*/

		if (name === 'sound' || name === 'sound.effect') {
			Object.keys(get('sound.effect')).forEach(preload);
		}

		/* If an effect URL was just set, preload it. */

		const effectMatch = /^sound\.effect\.([^\.]+)\.url$/.exec(name);

		if (effectMatch && effectMatch[1]) {
			preload(effectMatch[1]);
			return;
		}
	});
}

/*
Returns HTML to play a sound effect.

FIXME this is wrong... it will cause the effect to get cut off if you navigate away from the passage before it finishes playing. Need a functional call instead. Can we drop dom-mount event?
*/

export function effectHtml(name, volume) {
	const url = get(`sound.effect.${name}.url`);
	const description = get(`sound.effect.${name}.description`);

	return `<audio src="${url}" autoplay="yes" data-cb-sound-base-volume="${volume}">${description}</audio>`;
}
