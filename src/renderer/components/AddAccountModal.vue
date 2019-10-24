<template>
<div>
<b-modal id="addaccount" ref="accounts" title="Add Account" hide-footer centered no-stacking>
    <p class="mb-4"><strong>Services</strong></p>
    <b-list-group class="pl-0 pr-0">
        <b-list-group-item v-b-modal.feedbin button>
            <b-media no-body>
                <b-media-aside vertical-align="center">
                     <svg  xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 119.309 100.953" preserveAspectRatio="xMidYMin meet"><g><path d="M57.738.396c-27.5-3.7-50.2 19.2-50.2 41.4l102.6 1c.1-22.1-25.1-38.7-52.4-42.4zM114.138 85.696H6.038s-2.8 13.2 1.5 13.6c19.4 1.9 83.9 2.5 103 0 5.4-.7 3.5-13.6 3.6-13.6zM116.038 54.396c-2.4-2.3-15.2 0-15.2 0s-11.3 16.3-16.1 16.3c-4.7 0-20.8-16.3-20.8-16.3s-44.7-2.5-60.3 0c-4.8.8-4.9 23.3 0 23.3 15.5-.1 89.9-.1 112.4 0 4.8.1 3.9-19.3 0-23.3z"/></g></svg>
                </b-media-aside>
                <b-media-body class="ml-3">
                    <p class="mt-3 mb-0"><strong>Feedbin</strong></p>
                    <p>
                       feedbin.com
                    </p>
                </b-media-body>
            </b-media>
        </b-list-group-item>
    </b-list-group>
</b-modal>
    <feedbin-modal></feedbin-modal>
</div>
</template>