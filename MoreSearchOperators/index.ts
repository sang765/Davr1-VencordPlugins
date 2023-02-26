/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import definePlugin from "@utils/types";

interface SearchFilter {
    componentType: "FILTER";
    regex: RegExp;
    key: string;
    validator: (match: any) => boolean;
    getAutocompletions: (match: any) => { text: string; }[];
}

interface AnswerFilter {
    componentType: "ANSWER";
    regex: RegExp;
    validator: (match: any) => boolean;
    follows: string[];
    queryKey: string;
    mutable: boolean;
    _dataKey: string | number;
}

interface CustomFilters {
    [name: string]: SearchFilter | AnswerFilter;
}

const searchOperators: CustomFilters = {
    FILTER_SORT_ORDER: {
        componentType: "FILTER",
        regex: /sortOrder:/i,
        key: "sortOrder:",
        validator: () => true,
        getAutocompletions: () => [{ text: "descending" }, { text: "ascending" }]
    },
    ANSWER_SORT_ORDER: {
        componentType: "ANSWER",
        regex: /\s*(asc|desc)(?:ending)?/i,
        validator: function (match) {
            let value = match.getMatch(1);
            switch (value) {
                case "asc":
                    match.setData("sortOrder", "asc");
                    return true;
                case "desc":
                    match.setData("sortOrder", "desc");
                    return true;
                default:
                    return false;
            }
        },
        follows: ["FILTER_SORT_ORDER"],
        queryKey: "sort_order",
        mutable: true,
        _dataKey: "sortOrder"
    },
    FILTER_SORT_BY: {
        componentType: "FILTER",
        regex: /sortBy:/i,
        key: "sortBy:",
        validator: () => true,
        getAutocompletions: () => [{ text: "relevance" }, { text: "timestamp" }]
    },
    ANSWER_SORT_BY: {
        componentType: "ANSWER",
        regex: /\s*(relevance|timestamp)/i,
        validator: function (match) {
            let value = match.getMatch(1);
            switch (value) {
                case "relevance":
                    match.setData("sortBy", "relevance");
                    return true;
                case "timestamp":
                    match.setData("sortBy", "timestamp");
                    return true;
                default:
                    return false;
            }
        },
        follows: ["FILTER_SORT_BY"],
        queryKey: "sort_by",
        mutable: true,
        _dataKey: "sortBy"
    },
    FILTER_EMBED_TYPE: {
        componentType: "FILTER",
        regex: /embedType:/i,
        key: "embedType:",
        validator: () => true,
        getAutocompletions: () => [{ text: "gifv" }, { text: "gif" }]
    },
    ANSWER_EMBED_TYPE: {
        componentType: "ANSWER",
        regex: /\s*([^\s]+)/i,
        validator: function (match) {
            match.setData("embedType", match.getMatch(1));
            return true;
        },
        follows: ["FILTER_EMBED_TYPE"],
        queryKey: "embed_type",
        mutable: true,
        _dataKey: "embedType"
    },
    FILTER_FILE_NAME: {
        componentType: "FILTER",
        regex: /fileName:/i,
        key: "fileName",
        validator: () => true,
        getAutocompletions: () => []
    },
    ANSWER_FILE_NAME: {
        componentType: "ANSWER",
        regex: /(?:\s*([^\s]+))/,
        validator: function (match) {
            match.setData("fileName", match.getMatch(1));
            return true;
        },
        follows: ["FILTER_FILE_NAME"],
        queryKey: "attachment_filename",
        mutable: true,
        _dataKey: "fileName"
    },
    FILTER_FILE_TYPE: {
        componentType: "FILTER",
        regex: /fileType:/i,
        key: "fileType",
        validator: () => true,
        getAutocompletions: () => [{ text: "png" }, { text: "jpg" }, { text: "webp" }, { text: "gif" }, { text: "mp4" }, { text: "txt" }, { text: "js" }, { text: "css" }, { text: "zip" }]
    },
    ANSWER_FILE_TYPE: {
        componentType: "ANSWER",
        regex: /(?:\s*([^\s]+))/,
        validator: function (match) {
            match.setData("fileType", match.getMatch(1));
            return true;
        },
        follows: ["FILTER_FILE_TYPE"],
        queryKey: "attachment_extension",
        mutable: true,
        _dataKey: "fileType"
    }
};

export default definePlugin({
    name: "MoreSearchOperators",
    description: "Adds experimental search operators.",
    authors: [{
        id: 457579346282938368n,
        name: "Davri",
    }],

    patches: [{
        find: "Messages.SEARCH_SHORTCUT",
        replacement: {
            match: /(.)\((.),.\..{1,3}\.ANSWER_PINNED/,
            replace: Object.keys(searchOperators).map(a => `$1($2,"${a}",$self.searchOperators.${a}),`).join("") + "$&"
        }
    }, {
        find: "Messages.SEARCH_ANSWER_FROM",
        replacement: {
            match: /var .=.\[.\];switch\(.\)\{/,
            replace: "$&" + Object.entries(searchOperators).filter(([_, v]) => v.componentType === "ANSWER").map(([k, v]) => `case "${k}":a.add(e.getData("${v['_dataKey']}"));break;`).join("")
        }
    }],

    searchOperators
});