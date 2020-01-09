<template>
    <div class="tune-playlist">
        <div class="album-image"></div>
        <p class="md-headline headline">Tune Playlist</p>
        <p>Generate a playlist of recommended tracks based on a number of tunable factors, such as acousticness,
            danceability and much more</p>
        <p class="md-caption">The playlist is based on 1 to 5 genres</p>
        <md-field>
            <md-select v-model="selectedGenres" multiple name="genre" id="genre" placeholder="No seed genre picked">
                <md-option v-for="gen in genres" :key="gen" :value="gen">
                    {{gen.substr(0, 1).toUpperCase() + gen.substr(1)}}
                </md-option>
            </md-select>
        </md-field>
        <div v-for="tunable in tunables" :key="tunable.name">
            <md-switch class="switch" v-model="tunable.active"/>
            <div style="display: inline-block">
                <md-tooltip>Switch this field to tune {{tunable.name}}</md-tooltip>
                <span class="md-title">{{tunable.name.substr(0, 1).toUpperCase() + tunable.name.substr(1)}}</span>
            </div>
            <div v-if="tunable.active">
                <md-field v-if="tunable.hasOwnProperty('select')">
                    <md-select v-model="tunable.value">
                        <md-option v-for="opt in tunable.select" :key="opt.name" :value="opt.value">
                            {{opt.name}}
                        </md-option>
                    </md-select>
                </md-field>
                <label class="label" v-else>
                    <span class="value">{{tunable.value}}{{tunable.hasOwnProperty('unit')? ' ' + tunable.unit : ''}}</span>
                    <input class="value-input" v-model="tunable.value" type="range" :min="tunable.min"
                           :max="tunable.max"
                           :step="tunable.step">
                </label>
            </div>
            <p class="md-caption">{{tunable.description}}</p>
            <md-divider/>
        </div>
        <md-button class="md-raised md-accent generate-button" @click="generate">Generate playlist</md-button>
    </div>
</template>

<script>
    import SpotifyApi from "../js/SpotifyApi";

    export default {
        name: "TunePlaylist",
        data() {
            return {
                genres: [],
                selectedGenres: [],
                tunables: [
                    {
                        name: 'acousticness',
                        description: 'A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.',
                        min: 0,
                        max: 1,
                        step: 0.01,
                        value: 0.5,
                    },
                    {
                        name: 'danceability',
                        description: 'Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.',
                        min: 0,
                        max: 1,
                        step: 0.01,
                        value: 0.5,
                    },
                    {
                        name: 'energy',
                        description: 'Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.',
                        min: 0,
                        max: 1,
                        step: 0.01,
                        value: 0.5,
                    },
                    {
                        name: 'instrumentalness',
                        description: 'Predicts whether a track contains no vocals. “Ooh” and “aah” sounds are treated as instrumental in this context. Rap or spoken word tracks are clearly “vocal”. The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content. Values above 0.5 are intended to represent instrumental tracks, but confidence is higher as the value approaches 1.0.',
                        min: 0,
                        max: 1,
                        step: 0.01,
                        value: 0.5,
                    },
                    {
                        name: 'liveness',
                        description: 'Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live.',
                        min: 0,
                        max: 1,
                        step: 0.01,
                        value: 0.5,
                    },
                    {
                        name: 'loudness',
                        description: 'The overall loudness of a track in decibels (dB). Loudness values are averaged across the entire track and are useful for comparing relative loudness of tracks. Loudness is the quality of a sound that is the primary psychological correlate of physical strength (amplitude).',
                        min: -80,
                        max: 0,
                        step: 0.1,
                        value: -40,
                        unit: 'dB',
                    },
                    {
                        name: 'popularity',
                        description: 'The popularity of the track. The value will be between 0 and 100, with 100 being the most popular. The popularity is calculated by algorithm and is based, in the most part, on the total number of plays the track has had and how recent those plays are.',
                        min: 0,
                        max: 100,
                        step: 1,
                        value: 50,
                    },
                    {
                        name: 'speechiness',
                        description: 'Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value. Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. Values below 0.33 most likely represent music and other non-speech-like tracks.',
                        min: 0,
                        max: 1,
                        step: 0.01,
                        value: 0.5,
                    },
                    {
                        name: 'tempo',
                        description: 'The overall estimated tempo of a track in beats per minute (BPM). In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.',
                        min: 1,
                        max: 400,
                        step: 1,
                        value: 100,
                        unit: 'bpm',
                    },
                    {
                        name: 'valence',
                        description: 'A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).',
                        min: 0,
                        max: 1,
                        step: 0.01,
                        value: 0.5,
                    },
                    {
                        name: 'mode',
                        description: 'Mode indicates the modality (major or minor) of a track, the type of scale from which its melodic content is derived.',
                        select: [
                            {name: 'Major', value: 1},
                            {name: 'Minor', value: 0},
                        ],
                        value: 1,
                    },
                    {
                        name: 'key',
                        description: 'The key the track is in.',
                        select: [
                            {name: 'C', value: 0},
                            {name: 'C♯, D♭', value: 1},
                            {name: 'D', value: 2},
                            {name: 'D♯, E♭', value: 3},
                            {name: 'E', value: 4},
                            {name: 'F', value: 5},
                            {name: 'F♯, G♭', value: 6},
                            {name: 'G', value: 7},
                            {name: 'G♯, A♭', value: 8},
                            {name: 'A', value: 9},
                            {name: 'A♯, B♭', value: 10},
                            {name: 'B', value: 11},
                        ],
                        value: 4,
                    }
                ]
            }
        },
        async mounted() {
            this.genres = (await SpotifyApi.api.getAvailableGenreSeeds()).genres
                .map(g => g.split('-')
                    .map(w => w.substr(0, 1).toUpperCase() + w.substr(1)).join(' '));
        },
        methods: {
            generate() {
                if (this.selectedGenres.length > 5) {
                    alert("You can't select more than 5 genres");
                    return;
                }
                if (this.selectedGenres.length === 0) {
                    alert("You have to select at least 1 genre");
                    return;
                }

                let options = {};
                if (this.selectedGenres.length > 0)
                    options.seed_genres = this.selectedGenres.map(genre => genre.replace(/ /gi, '-').toLowerCase()).join(',');

                for (let tunable of this.tunables.filter(t => t.active))
                    options['target_' + tunable.name] = tunable.value;

                console.log(options);
                if (Object.keys(options).length === 0) {
                    alert("You should select some tunables before generating a playlist");
                    return;
                }

                options.custom = true;

                this.$router.push({
                    path: '/radio',
                    query: options,
                });
            },
        },
    }
</script>

<style scoped>
    .headline {
        text-align: center;
    }

    .album-image {
        background-image: url('../assets/recommendation.png');
        width: 150px;
        height: 150px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        display: block;
        margin: 30px auto;
        border-radius: 3px;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
    }

    .tune-playlist {
        padding: 10px;
    }

    .switch {
        margin-right: 10px;
    }

    .label {
        display: flex;
    }

    .value {
        padding: 15px;
        min-width: 100px;
    }

    .value-input {
        width: calc(100% - 100px);
        margin: 15px 0;
    }

    .generate-button {
        display: block;
        margin: 40px auto;
        width: 60%;
    }

    input[type=range] {
        -webkit-appearance: none;
        height: 20px;
        width: 100%;
        border-radius: 10px;
        background-color: rgba(255, 255, 255, 0.2);
    }

    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 10px;
        background-color: var(--md-theme-default-primary)
    }

    input[type=range]:focus {
        outline: none; /* Removes the blue border. You should probably do some kind of focus styling for accessibility reasons though. */
    }

    input[type=range]::-ms-track {
        width: 100%;
        cursor: pointer;

        /* Hides the slider so custom styles can be added */
        background: transparent;
        border-color: transparent;
        color: transparent;
    }

</style>