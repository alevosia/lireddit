import { Box } from '@chakra-ui/core'
import { withUrqlClient } from 'next-urql'
import { NavBar } from '../components/NavBar'
import { useAllPostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'

const Index: React.FC<{}> = () => {
    const [{ fetching, data }] = useAllPostsQuery()

    return (
        <Box>
            <NavBar />
            {fetching ? (
                <div>Loading...</div>
            ) : data ? (
                data.posts.map((p) => <div key={p.id}>{p.title}</div>)
            ) : null}
        </Box>
    )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
