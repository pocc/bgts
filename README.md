# Unofficial typescript BGA API

There are a couple ways of authenticating: With the GUI by manually inputting the username/password and by sending a fetch that authenticates and creates cookies that can be later used as part of accessing privileged webpages.

# Todo

x is done
X is done AND has tests

## Gestalt
* [ ] Authentication
* [ ] Create game
* [ ] Provide interface for playing game

## Remaining
* [ ] BGA
    * [ ] Authentication
        * [x] Authentication with GUI
        * [x] Authentication with fetch
        * [ ] logout(): error 
    * [ ] Your player
        * [ ] Get friends list
        * [ ] Get your active game list
        * [ ] Tournaments
            * [ ] Get available tournaments to join
            * [ ] Get information on a specific tournament
        * [ ] Get information about a game
        * [ ] Change preferences
        * [ ] Get invitations
        * [ ] Get recently finished games
        * [ ] Current Games
    * [ ] Creating Games
        * [ ] Create standalone game with options (specified with words)
        * [ ] Join arena game
        * [ ] Join tournament
    * [ ] Playing the game
        * [ ] 
    * [ ] Messages
        * [ ] Send Message to Friend
        * [ ] Get message history with a person
    * [ ] Players
        * [ ] Data
            * isOnline: boolean
            * age: number
            * langs: [countrycode]
            * location: countrycode
            * lastSeen: Date
            * memberSince: Date
            * premium: boolean
            * reputation: number
            * recentPenalities: list[penalty]
            * recentActivity: list[activity]
            * achievements: [achievement]
            * playerStats: [playerStat]
            * gamesPlayed: [game]
            * friendList: [player]
            * groups: [group]
        * [ ] getData()
        * [ ] addFriend()
        * [ ] removeFriend()
        * [ ] reportPlayer()
        * [ ] addLike()
        * [ ] addDislike()
        * [ ] addPersonalNote()
        * [ ] sharedGames(player: Player)
    * [ ] Report a bug
    * [ ] Make a suggestion
    * [ ] Groups
        * [ ] Search groups
        * [ ] Create group
        * [ ] Join group
        * [ ] Quit group
        * [ ] Post to group
    * [ ] Forums
        * [ ] Get topics for forum
        * [ ] Get content of forum
* [ ] Yucata
    * [ ] Authentication
        * [x] Authentication with GUI
        * [ ] Authentication with fetch (possible with python + ntlm, haven't figured out with node)
        * [ ] Logout
    * [ ] Messages
        * [ ] Send Message to Friend
    * [ ] Your player
        * [ ] getFriends(): [player]
        * [ ] addFriend(player: string): error
        * [ ] addPlayerNote(player: string, note: string): error
        * [ ] addPlayerTags(player: string, tags: [string]): error
        * [ ] Get your active game list
        * [ ] Tournaments
            * [ ] Get available tournaments to join
            * [ ] Get information on a specific tournament
        * [ ] Get information about a game
        * [ ] Change preferences
        * [ ] changeLang(lang: string): error
    * [ ] Forums
        * [ ] Post bug
        * [ ] Post feature request
    * [ ] Players
        * [ ] Data
            * [ ] yearBorn: number
            * [ ] registered: Date
            * [ ] lastLogin: Date
            * [ ] BGGUsername: string
            * [ ] favoriteGames: [game]
            * [ ] likedGames: [game]
* [ ] Tabletopia
    * [ ] Authentication
        * [x] Authentication with GUI
        * [ ] Authentication with fetch (there appears to be a cookie that needs to be sent)
        * [ ] Logout
    * [ ] Messages
        * [ ] Send Message to Friend
    * [ ] Your player
        * [ ] getFriends(): [player]
        * [ ] addFriend(player: string): error
        * [ ] addPlayerNote(player: string, note: string): error
        * [ ] addPlayerTags(player: string, tags: [string]): error
        * [ ] Get your active game list
        * [ ] Tournaments
            * [ ] Get available tournaments to join
            * [ ] Get information on a specific tournament
        * [ ] Get information about a game
        * [ ] Change preferences
        * [ ] changeLang(lang: string): error
    * [ ] Forums
        * [ ] Post bug
        * [ ] Post feature request
    * [ ] Players
        * [ ] Data
            * [ ] yearBorn: number
            * [ ] registered: Date
            * [ ] lastLogin: Date
            * [ ] BGGUsername: string
            * [ ] favoriteGames: [game]
            * [ ] likedGames: [game]