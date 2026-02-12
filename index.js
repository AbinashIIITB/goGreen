import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";

const path = "./data.json";
const git = simpleGit();

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===== PIXEL ART FOR "HI !" =====
// 7 rows (Sun=0 to Sat=6), each letter is columns
// Grid: H(5) + gap(2) + I(3) + gap(2) + !(1) = 13 columns/weeks

const H = [
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
];

const I = [
  [1, 1, 1],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [1, 1, 1],
];

const EXCL = [
  [1],
  [1],
  [1],
  [1],
  [1],
  [0],
  [1],
];

// Build the combined grid
function buildGrid() {
  const grid = [];
  for (let row = 0; row < 7; row++) {
    grid[row] = [
      ...H[row],       // 5 cols: H
      0, 0,            // 2 cols: gap
      ...I[row],       // 3 cols: I
      0, 0,            // 2 cols: gap
      ...EXCL[row],    // 1 col:  !
    ];
  }
  return grid;
}

// Starting date: Sunday March 9, 2025
// This places the art nicely in the Mar-Jun 2025 section:
//   H:  Mar 9 → Apr 6  (5 weeks)
//   gap: Apr 13-20      (2 weeks)
//   I:  Apr 27 → May 11 (3 weeks)
//   gap: May 18-25      (2 weeks)
//   !:  Jun 1            (1 week)
const startDate = moment("2025-03-09");

function buildCommitList() {
  const grid = buildGrid();
  const commits = [];
  const numCols = grid[0].length; // 13

  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < 7; row++) {
      if (grid[row][col] === 1) {
        const date = moment(startDate).add(col, "weeks").add(row, "days");
        // 3-7 commits per green cell for a solid visible square
        const numCommits = randInt(3, 7);
        for (let c = 0; c < numCommits; c++) {
          const d = moment(date)
            .add(randInt(9, 22), "hours")
            .add(randInt(0, 59), "minutes");
          commits.push(d.format());
        }
      }
    }
  }

  commits.sort((a, b) => moment(a).valueOf() - moment(b).valueOf());
  return commits;
}

// Execute commits sequentially
function runCommits(commitDates, index) {
  if (index >= commitDates.length) {
    console.log(`\n✅ All ${commitDates.length} commits done! Force pushing...`);
    git.push(["-f", "origin", "main"], () => {
      console.log("🚀 Pushed! Check your GitHub profile for HI !");
    });
    return;
  }

  const date = commitDates[index];
  const data = { date };

  jsonfile.writeFile(path, data, () => {
    git.add([path]).commit(date, { "--date": date }, () => {
      if ((index + 1) % 25 === 0 || index === 0) {
        console.log(`[${index + 1}/${commitDates.length}] ${date}`);
      }
      runCommits(commitDates, index + 1);
    });
  });
}

// Main
const commits = buildCommitList();
console.log(`🎨 Writing "HI !" on GitHub contribution graph`);
console.log(`   Period: March 9 – June 7, 2025`);
console.log(`   Green cells: ${new Set(commits.map(c => moment(c).format("YYYY-MM-DD"))).size}`);
console.log(`   Total commits: ${commits.length}\n`);
runCommits(commits, 0);
