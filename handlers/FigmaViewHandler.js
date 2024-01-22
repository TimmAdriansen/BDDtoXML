class FigmaViewHandler {

    static convertLinkToEmbed(link) {
        let embedLink = "";
        
        if(!link.includes("file") || !link.includes("https://www.figma.com")){
            return "0";
        }

        let split = link.split('/');

        split[1] = "//";
        split[2] = split[2] + "/";
        split[3] = "embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2F";
        split[4] = split[4] + "%2F";
        split[5] = split[5].replace("?type=design&node-id=", "%3Fpage-id%26type%3Ddesign%26node-id%3D");
        split[5] = split[5].replace("%3A", "-");
        let secondarySplit = split[5].split("&mode=design");
        secondarySplit[1] = "%26scaling%3Dscale-down-width%26mode%3Ddesign";
        split[5] = secondarySplit[0] + secondarySplit[1];

        split.forEach(function (split, index) {
            embedLink += split;
        });
        
        return embedLink;
    }

}

module.exports = FigmaViewHandler;