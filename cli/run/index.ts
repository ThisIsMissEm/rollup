import { env } from 'node:process';
import type { MergedRollupOptions } from '../../src/rollup/types';
import { errDuplicateImportOptions, errFailAfterWarnings } from '../../src/utils/error';
import { isWatchEnabled } from '../../src/utils/options/mergeOptions';
import { getAliasName } from '../../src/utils/relativeId';
import { loadFsEvents } from '../../src/watch/fsevents-importer';
import { handleError } from '../logging';
import type { BatchWarnings } from './batchWarnings';
import build from './build';
import { getConfigPath } from './getConfigPath';
import { loadConfigFile } from './loadConfigFile';
import loadConfigFromCommand from './loadConfigFromCommand';

export default async function runRollup(command: Record<string, any>): Promise<void> {
	let inputSource;
	if (command._.length > 0) {
		if (command.input) {
			handleError(errDuplicateImportOptions());
		}
		inputSource = command._;
	} else if (typeof command.input === 'string') {
		inputSource = [command.input];
	} else {
		inputSource = command.input;
	}

	if (inputSource && inputSource.length > 0) {
		if (inputSource.some((input: string) => input.includes('='))) {
			command.input = {};
			inputSource.forEach((input: string) => {
				const equalsIndex = input.indexOf('=');
				const value = input.substring(equalsIndex + 1);
				const key = input.substring(0, equalsIndex) || getAliasName(input);

				command.input[key] = value;
			});
		} else {
			command.input = inputSource;
		}
	}

	if (command.environment) {
		const environment = Array.isArray(command.environment)
			? command.environment
			: [command.environment];

		environment.forEach((arg: string) => {
			arg.split(',').forEach((pair: string) => {
				const [key, ...value] = pair.split(':');
				env[key] = value.length === 0 ? String(true) : value.join(':');
			});
		});
	}

	if (isWatchEnabled(command.watch)) {
		await loadFsEvents();
		const { watch } = await import('./watch-cli');
		watch(command);
	} else {
		try {
			const { options, warnings } = await getConfigs(command);
			try {
				for (const inputOptions of options) {
					await build(inputOptions, warnings, command.silent);
				}
				if (command.failAfterWarnings && warnings.warningOccurred) {
					warnings.flush();
					handleError(errFailAfterWarnings());
				}
			} catch (err: any) {
				warnings.flush();
				handleError(err);
			}
		} catch (err: any) {
			handleError(err);
		}
	}
}

async function getConfigs(
	command: any
): Promise<{ options: MergedRollupOptions[]; warnings: BatchWarnings }> {
	if (command.config) {
		const configFile = await getConfigPath(command.config);
		const { options, warnings } = await loadConfigFile(configFile, command);
		return { options, warnings };
	}
	return await loadConfigFromCommand(command);
}
