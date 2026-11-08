import { createStore } from 'solid-js/store';
import { makePersisted } from '@solid-primitives/storage';

import type { GameState } from './gameTypes';

const STORAGE_KEY = 'clicker-save';

const initialState: GameState = {
	currency: 0,
	totalClicks: 0,

	clickPower: 1,
	autoIncome: 0,

	clickUpgradeCost: 10,
	autoUpgradeCost: 50,
};

// Validate loaded numeric values
const readNumber = (value: unknown, fallback: number): number =>
	typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;

// Deserialize and validate saved data
const deserializeGameState = (value: string): GameState => {
	try {
		const parsed: unknown = JSON.parse(value);

		if (typeof parsed !== 'object' || parsed === null) {
			return { ...initialState };
		}

		const data = parsed as Record<string, unknown>;

		return {
			currency: readNumber(data.currency, 0),

			totalClicks: Math.floor(readNumber(data.totalClicks, 0)),

			clickPower: Math.max(1, readNumber(data.clickPower, 1)),

			autoIncome: readNumber(data.autoIncome, 0),

			clickUpgradeCost: Math.max(1, readNumber(data.clickUpgradeCost, 10)),

			autoUpgradeCost: Math.max(1, readNumber(data.autoUpgradeCost, 50)),
		};
	} catch {
		return { ...initialState };
	}
};

export const createGameStore = () => {
	const [state, setState] = makePersisted(createStore<GameState>({ ...initialState }), {
		name: STORAGE_KEY,
		deserialize: deserializeGameState,
	});

	// Click action
	const click = () => {
		const power = state.clickPower;

		setState('currency', value => value + power);
		setState('totalClicks', value => value + 1);
	};

	// Buy click upgrade
	function buyClickUpgrade(): boolean {
		const cost = state.clickUpgradeCost;

		if (state.currency < cost) return false;

		setState({
			currency: state.currency - cost,
			clickPower: state.clickPower + 1,
			clickUpgradeCost: Math.ceil(cost * 1.5),
		});

		return true;
	}

	// Buy passive income upgrade
	const buyAutoUpgrade = () => {
		const cost = state.autoUpgradeCost;

		if (state.currency < cost) return false;

		setState({
			currency: state.currency - cost,
			autoIncome: state.autoIncome + 1,
			autoUpgradeCost: Math.ceil(cost * 1.7),
		});
	};

	// Generate passive income
	const addPassiveIncome = () => {
		const income = state.autoIncome;

		if (income <= 0) return;

		setState('currency', value => value + income);
	};

	// Reset progress
	const reset = () => setState({ ...initialState });

	return {
		state,

		click,
		buyClickUpgrade,
		buyAutoUpgrade,
		addPassiveIncome,
		reset,
	};
};
