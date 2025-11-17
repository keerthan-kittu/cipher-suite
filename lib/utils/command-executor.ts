/**
 * Safe command execution utility with timeout and error handling
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from '../config/env.config';

const execAsync = promisify(exec);

/**
 * Result of command execution
 */
export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
}

/**
 * Options for command execution
 */
export interface CommandOptions {
  timeout?: number;
  maxBuffer?: number;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

/**
 * Error thrown when command execution fails
 */
export class CommandExecutionError extends Error {
  constructor(
    message: string,
    public exitCode: number,
    public stdout: string,
    public stderr: string,
    public timedOut: boolean = false
  ) {
    super(message);
    this.name = 'CommandExecutionError';
  }
}

/**
 * Safely executes a shell command with timeout and error handling
 */
export async function executeCommand(
  command: string,
  args: string[] = [],
  options: CommandOptions = {}
): Promise<CommandResult> {
  const {
    timeout = config.command.timeout,
    maxBuffer = config.command.maxBuffer,
    cwd,
    env = process.env,
  } = options;

  // Build the full command with escaped arguments
  const fullCommand = `${command} ${args.map(arg => `"${arg}"`).join(' ')}`;

  try {
    const { stdout, stderr } = await execAsync(fullCommand, {
      timeout,
      maxBuffer,
      cwd,
      env,
      shell: '/bin/sh',
    });

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
      timedOut: false,
    };
  } catch (error: any) {
    // Check if it was a timeout
    const timedOut = error.killed && error.signal === 'SIGTERM';

    if (timedOut) {
      throw new CommandExecutionError(
        `Command timed out after ${timeout}ms`,
        -1,
        error.stdout || '',
        error.stderr || '',
        true
      );
    }

    // Command executed but returned non-zero exit code
    throw new CommandExecutionError(
      error.message || 'Command execution failed',
      error.code || -1,
      error.stdout || '',
      error.stderr || '',
      false
    );
  }
}

/**
 * Parses JSON output from a command
 */
export function parseJSONOutput<T>(output: string): T {
  try {
    return JSON.parse(output);
  } catch (error) {
    throw new Error('Failed to parse command output as JSON');
  }
}

/**
 * Parses line-based output from a command
 */
export function parseLineOutput(output: string): string[] {
  return output
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

/**
 * Checks if a command is available in the system
 */
export async function isCommandAvailable(command: string): Promise<boolean> {
  try {
    await executeCommand('which', [command], { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates that required commands are available
 */
export async function validateRequiredCommands(commands: string[]): Promise<void> {
  const missing: string[] = [];

  for (const command of commands) {
    const available = await isCommandAvailable(command);
    if (!available) {
      missing.push(command);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Required commands not found: ${missing.join(', ')}. Please install them before running scans.`
    );
  }
}
