import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { bToastError } from '../../components/BToast';
import { getUserProfileWithWallet } from "../../apiservices/authService";
import { updateUser, updateUserBalanceAndExposure } from "../../redux/userSlice";
import { getGamesByCategory } from "../../apiservices/jsGamesService";
import LoaderSection from "../../components/LoaderSection";
import useGameLaunch from "../../hooks/useGameLaunch";
import GameFrame from "../../components/casino/GameFrame";

// The tile the reference paints behind every crash tile (its own
// casino/default.jpeg, downloaded locally — never hotlinked).
const FALLBACK_TILE_IMG = '/assets/casino/games/default-2.jpeg';

// How many tiles the crash grid shows. The reference renders exactly this many
// and has no pager.
const GRID_SIZE = 23;




export default function CrashPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const reduxBalance = useSelector((state) => state.user.balance);
    const { user } = useSelector(state => state.user);

    const [localUser, setLocalUser] = useState(null);
    const [games, setGames] = useState([]);
    const { launching, launch } = useGameLaunch();
    const [loading, setLoading] = useState(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Fetch user profile on mount
    useEffect(() => {
        if (!token) return;
        getUserProfileWithWallet()
            .then((profileResp) => {
                const rawUser = profileResp?.user || profileResp;
                const rawBalance =
                    rawUser?.inr_balance ??
                    rawUser?.wallet?.inr_balance ??
                    rawUser?.balance ??
                    rawUser?.wallet?.balance;

                const parsedBalance = (() => {
                    const n = parseFloat(rawBalance);
                    return Number.isFinite(n) ? n : 0;
                })();

                const userProfile = {
                    ...rawUser,
                    balance: parsedBalance,
                    inr_balance: parsedBalance,
                };

                setLocalUser(userProfile);
                dispatch(updateUser(userProfile));
                dispatch(updateUserBalanceAndExposure({ balance: parsedBalance }));
            })
            .catch((err) => {
                console.error("Error fetching user profile in CrashPage", err);
                setLocalUser(null);
                if (err.response?.status === 401 && localStorage.getItem('token') !== 'demo-token') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/');
                }
            });
    }, [dispatch, token, navigate]);

    // One page of GRID_SIZE, no pager — the reference's crash grid is exactly 23
    // tiles and stops there, even though the category holds ~198 rows.
    //
    // This endpoint's pagination is priority-first: it serves the curated crash
    // queue in curated order, then fills the rest of the page from the category.
    // The queue is 21 games today, so tiles 22-23 are filler. Curate two more in
    // the admin panel and they take those slots automatically — the number here
    // is the grid SIZE, not a list of games.
    const fetchGames = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getGamesByCategory('crash', { page: 1, per_page: GRID_SIZE });
            if (!res.success) {
                bToastError(res.msg || "Failed to load crash games");
                setGames([]);
                return;
            }
            setGames((res.payload?.games || []).slice(0, GRID_SIZE));
        } catch (err) {
            console.error("Error fetching crash games:", err);
            bToastError("An error occurred while loading games.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    const [launchUrl, setLaunchUrl] = useState(null);
    const [selectedGame, setSelectedGame] = useState(null);

    const handleLaunchGame = async (game) => {
        // Shared with the slot and fantasy grids: loader for >= 1s, then either
        // the game or the reason it did not open.
        const url = await launch({ uid: game.game_uid, name: game.game_name });
        if (url) {
            setLaunchUrl(url);
            setSelectedGame(game);
        }
    };

    // Reference markup: one full-width grid of art-only tiles, no title, no
    // caption, no pager — `report-container > report-box casino-box fancy-page >
    // container-fluid-5 > row row1 > col-md-12 > casino-banners`. Every class
    // here already exists in reference/*.css, so the page needs no CSS of its own.
    return (
        <div className={`report-container${launching ? ' loader-section-parent' : ''}`}>
            {launching && <LoaderSection />}
            <div className={`report-box casino-box fancy-page${launchUrl ? ' frame-open' : ''}`}>
                <div className="container-fluid container-fluid-5">
                    <div className="row row1">
                        <div className="col-md-12">
                            <div className="casino-banners">
                                {loading || games.length === 0 ? null : games.map((game, idx) => (
                                    // The feed repeats a few titles (Crash Bonus and Go
                                    // Rush each appear twice in the crash queue), so the
                                    // key carries the position as well as the uid.
                                    <div className="casino-banner-item" key={`${game.game_uid}-${idx}`}>
                                        {/* The reference writes
                                            href="javascript:void(0)", but React 19
                                            blocks javascript: URLs and emits a
                                            throwing one in its place, so this is an
                                            anchor with no href. Only bootstrap's
                                            a:not([href]) colour rule differs, and the
                                            tile carries no anchor text. */}
                                        <a role="button" onClick={() => handleLaunchGame(game)}>
                                            <div
                                                style={{
                                                    backgroundSize: 'contain',
                                                    backgroundColor: 'rgb(0, 0, 0)',
                                                    backgroundPosition: 'center center',
                                                    backgroundRepeat: 'no-repeat',
                                                    paddingTop: '54%',
                                                    // Two layers, exactly as the reference: the
                                                    // game's own art in front, the default tile
                                                    // behind it so a missing file still paints.
                                                    backgroundImage: `url("${game.game_icon || FALLBACK_TILE_IMG}"), url("${FALLBACK_TILE_IMG}")`,
                                                }}
                                            />
                                            <div className="fancy-play"><i className="fas fa-play"></i></div>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* The grid above stays mounted while a game is open: the
                    reference parks this overlay at top:100% and slides it up. */}
                {launchUrl && (
                    <GameFrame
                        title={selectedGame?.game_name || 'Game'}
                        src={launchUrl}
                        onExit={() => { setLaunchUrl(null); setSelectedGame(null); }}
                    />
                )}
            </div>
        </div>
    );
}
