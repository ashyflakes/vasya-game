import 'modern-normalize/modern-normalize.css';
import '@fontsource-variable/inter/index.css';
import './root.css';
import './App.css';

import { createSignal, onCleanup, onMount } from 'solid-js';

import { createGameStore } from '@/game/gameStore.ts';

import styles from './App.module.css';
import VasyaImage from '@/components/VasyaImage/VasyaImage.tsx';
import CatFoodImage from '@/components/CatFoodImage/CatFoodImage.tsx';
import { soundManager } from '@/audio/sfxManager.ts';

const formatNumber = (value: number) => new Intl.NumberFormat('ru-RU').format(value);

export default function App() {
	const game = createGameStore();

	const [soundEnabled, setSoundEnabled] = createSignal(true);

	function toggleSound() {
		const nextValue = !soundEnabled();

		setSoundEnabled(nextValue);
		soundManager.setMuted(!nextValue);
	}

	function handleClick() {
		game.click();
		soundManager.playClick();
	}

	function handleClickUpgrade() {
		const purchased = game.buyClickUpgrade();

		if (purchased) {
			soundManager.playUpgrade();
		}
	}

	function handleAutoUpgrade() {
		const purchased = game.buyAutoUpgrade();

		if (purchased) {
			soundManager.playUpgrade();
		}
	}

	// Passive income timer
	onMount(() => {
		const intervalId = window.setInterval(() => {
			game.addPassiveIncome();
		}, 1000);

		onCleanup(() => {
			window.clearInterval(intervalId);
		});
	});

	return (
		<main class={styles.game}>
			<header class={styles.header}>
				<h1>Вася (Кликер)</h1>
				<p>Простейшая игра</p>
			</header>

			{/* Currency */}
			<section class={styles.balance}>
				<span>ВАШ БАЛАНС</span>

				<strong>{formatNumber(game.state.currency)}</strong>

				<span>васякойнов</span>
			</section>

			{/* Statistics */}
			<section class={styles.stats}>
				<div>
					<span>за клик</span>
					<strong>{game.state.clickPower}</strong>
				</div>

				<div>
					<span>за секунду</span>
					<strong>{game.state.autoIncome}</strong>
				</div>

				<div>
					<span>всего кликов</span>
					<strong>{formatNumber(game.state.totalClicks)}</strong>
				</div>
			</section>

			{/* Click button */}
			<section class={styles.clickArea}>
				<button class={styles.clickButton} type="button" onClick={handleClick}>
					<VasyaImage />
				</button>
			</section>

			{/* Upgrade shop */}
			<section class={styles.shop}>
				<h2>Улучшения</h2>

				<article class={styles.upgradeCard}>
					<CatFoodImage />
					<div>
						<h3>Корм</h3>

						<p>+1 васякойн/клик</p>

						<small>Сила: {game.state.clickPower}</small>
					</div>

					<button
						type="button"
						disabled={game.state.currency < game.state.clickUpgradeCost}
						onClick={handleClickUpgrade}
					>
						+ {game.state.clickUpgradeCost}
					</button>
				</article>

				<article class={styles.upgradeCard}>
					<VasyaImage />
					<div>
						<h3>+1 Вася</h3>

						<p>+1 васякойн/секунду</p>

						<small>Прибыль: {game.state.autoIncome}</small>
					</div>

					<button
						type="button"
						disabled={game.state.currency < game.state.autoUpgradeCost}
						onClick={handleAutoUpgrade}
					>
						+ {game.state.autoUpgradeCost}
					</button>
				</article>
			</section>

			<button type="button" aria-pressed={soundEnabled()} onClick={toggleSound}>
				{soundEnabled() ? 'звук: вкл.' : 'звук: выкл.'}
			</button>

			{/* Reset */}
			<button class={styles.resetButton} type="button" onClick={game.reset}>
				Ресет прогресса
			</button>
		</main>
	);
}
