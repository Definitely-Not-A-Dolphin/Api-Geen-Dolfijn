import type { GitHubRepository, Languages, Repository } from "#/src/types.ts";
import { Octokit } from "octokit";
import { WebSource } from "@kuusi/kuusi";

const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
const octokit = new Octokit({ auth: GITHUB_TOKEN });

const route = new WebSource({
  async GET(_, result) {
    const repoID = result.search.groups["repoID"];
    if (!repoID) {
      return new Response(null, {
        status: 400,
        statusText: "Please supply a repository ID.",
      });
    }

    const repositoryResponse = await octokit.request(
      `GET /repositories/${repoID}`,
    );

    if (repositoryResponse.status !== 200) {
      return new Response(null, {
        status: 500,
        statusText: "Error while fetching repository data.",
      });
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
      return new Response(null, {
        status: 500,
        statusText: "Error while fetching repository data.",
      });
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

    const returnData: Repository = {
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
      `\x1b[102m > \x1b[0m Returned Data: ${repositoryData.full_name}`,
      returnData,
    );

    return Response.json(returnData);
  },
});

export default route;
