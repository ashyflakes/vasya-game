import { Howl, Howler } from 'howler';

const sounds = {
	click: new Howl({
		src: ['/audio/meow.mp3'],
		volume: 0.75,
		preload: true,
	}),

	upgrade: new Howl({
		src: ['/audio/buy.mp3'],
		volume: 0.8,
		preload: true,
	}),
};

export const soundManager = {
	playClick() {
		sounds.click.play();
	},

	playUpgrade() {
		sounds.upgrade.play();
	},

	setMuted(muted: boolean) {
		Howler.mute(muted);
	},

	setVolume(volume: number) {
		Howler.volume(Math.max(0, Math.min(1, volume)));
	},
};
