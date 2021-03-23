declare module '@pontoon-addon/commons/src/RemoteLinks' {
  export class RemoteLinks {
    constructor();
    getTransvisionUrl(team: string): string;
    getMozillaStyleGuidesUrl(team: string): string;
    getElmoDashboardUrl(team: string): string;
    getMozillaWikiL10nTeamUrl(team: string): string;
    getCambridgeDictionaryUrl(): string;
    getMicrosoftTerminologySearchUrl(): string;
    getBugzillaReportUrlForSelectedTextOnPage(
      selectedText: string,
      pageUrl: string,
      team: string,
      teamComponent: string
    ): string;
    getPontoonAddonWikiUrl(): string;
  }
}
