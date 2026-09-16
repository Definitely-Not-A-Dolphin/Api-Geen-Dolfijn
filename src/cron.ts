import { Octokit } from "octokit";
import { GitHubRepository, Languages, Repository } from "#/src/types.ts";

const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN")!;
const octokit = new Octokit({ auth: GITHUB_TOKEN });
const repoIDs = ["1133847980"];

Deno.cron("Fetch GitHub Data", { hour: { every: 1 } }, async () => {
  const db = await Deno.openKv("kv.sqlite3");

  for (const repoID of repoIDs) {
    const repositoryResponse = await octokit.request(
      `GET /repositories/${repoID}`,
    );

    if (repositoryResponse.status !== 200) {
      console.log("Error while fetching repository data.");
      return;
    }

    const repositoryData = repositoryResponse.data as GitHubRepository;

    console.log(
      `\x1b[44m > \x1b[0m Fetch Log: ${repositoryData.full_name}`,
      repositoryResponse.headers,
    );

    // Get the languages
    const languageResponse = await octokit.request(
      `GET ${repositoryData.languages_url}`,
    );

    if (repositoryResponse.status !== 200) {
      console.log("Error while fetching repository data.");
      return;
    }

    console.log(
      `\x1b[43m > \x1b[0m Fetch Log Languages: ${repositoryData.full_name}`,
      languageResponse.headers,
    );

    const rawLanguageData = languageResponse.data as Languages;

    let totalCharacterCount = 0;
    for (const characterCount of Object.values(rawLanguageData)) {
      totalCharacterCount += characterCount;
    }

    const languageData: Languages = {};
    for (const [language, charCount] of Object.entries(rawLanguageData)) {
      const percent = Math.floor(charCount / totalCharacterCount * 1000) / 10;

      if (percent !== 0) languageData[language] = percent;
    }

    const githubData: Repository = {
      id: repositoryData.id,
      fullName: repositoryData.full_name,
      name: repositoryData.name,
      owner: {
        login: repositoryData.owner.login,
        avatarUrl: repositoryData.owner.avatar_url,
      },
      description: repositoryData.description,
      url: repositoryData.html_url,
      languages: languageData,
      license: repositoryData.license
        ? {
          name: repositoryData.license.name,
          url: repositoryData.license.url,
        }
        : null,
      stargazerCount: repositoryData.stargazers_count,
    };

    console.log(
      `\x1b[102m > \x1b[0m Parsed Data: ${repositoryData.full_name}`,
      githubData,
    );

    await db.set(["githubData", repoID], githubData);
    db.close();
  }
});
