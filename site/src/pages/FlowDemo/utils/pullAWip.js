import {first, sortBy} from 'lodash';

export const pullAWip = ({constructionQueue, demands}) => () => {
    const candidate = first(
        sortBy(
            constructionQueue,
            ['done', 'constructionOrder']
        )
    );
    return {
        constructionQueue: constructionQueue
            .filter(construction => construction !== candidate),
        demands: [
            ...demands,
            candidate
        ]
    };
};
