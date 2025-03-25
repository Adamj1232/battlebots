import { CombatTester } from './CombatTester.js';
import chalk from 'chalk';

async function runCombatTests() {
  console.log(chalk.blue('\n=== Running Combat System Tests ===\n'));

  const tester = new CombatTester();
  const results = await tester.runAllTests();

  let passCount = 0;
  let failCount = 0;

  results.forEach((result, index) => {
    if (result.success) {
      passCount++;
      console.log(chalk.green(`✓ ${result.message}`));
      if (result.data) {
        console.log(chalk.gray('  Data:', JSON.stringify(result.data, null, 2)));
      }
    } else {
      failCount++;
      console.log(chalk.red(`✗ ${result.message}`));
      if (result.data) {
        console.log(chalk.gray('  Data:', JSON.stringify(result.data, null, 2)));
      }
    }
    console.log(''); // Empty line between tests
  });

  console.log(chalk.blue('=== Test Summary ==='));
  console.log(chalk.green(`Passed: ${passCount}`));
  console.log(chalk.red(`Failed: ${failCount}`));
  console.log(chalk.blue(`Total: ${results.length}`));
  console.log(chalk.blue('===================\n'));

  return failCount === 0;
}

// Run tests
runCombatTests().then(success => {
  process.exit(success ? 0 : 1);
});

export { runCombatTests }; 