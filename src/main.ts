import {initializeExtension} from "./extension";
import {useContext} from "./context";
import {useRemoteConfig} from "./remote-config";
import {useAuth} from "./auth";
import {useSocket} from "./socket";
import {usePubSub} from "./pubsub";

const extension = initializeExtension();
const {onAuthorized} = useAuth(extension);
const {onContext} = useContext(extension);
const {getSegments, setSegment} = useRemoteConfig(extension);
const {on} = useSocket(extension);
const {publish, subscribe} = usePubSub(extension);

// basics
onContext((context, changed) => console.log(context, changed))
onAuthorized(user => console.log(user))

// remote config
getSegments().then(segments => console.log(segments))
setSegment('creator', {key: 'value'})
    .then(() => console.log('segment set'))

// socket
on('notifysub', (data) => console.log(data))

// pub-sub
subscribe('test', (data: any) => console.log(data))
publish('test', 'hello');




