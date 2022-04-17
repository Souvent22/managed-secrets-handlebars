# Import default environment variables, which are used in commands below
include help.mk
include defaults.mk
include locals.mk

docker-login :
	docker login -u "${DOCKER_USERNAME}" -p "${DOCKER_PASSWORD}"
# Build the application's Docker image
docker-build : ## # Build the application's Docker image
	# Partners
	DOCKER_BUILDKIT=1 docker build \
		-f ./Dockerfile \
		--ssh default=${PRIVATE_KEY_PATH} \
		-t ${DOCKER_REPO}:latest .

# Tag and push the application's Docker image to AWS' container registry
# Note that the local build tags as latest. We then re-tag latest 
# to be the current commit hash and push that to ECR.
docker-push : docker-login
	docker tag ${DOCKER_REPO}:latest ${DOCKER_REPO}:${IMAGE_TAG}
	docker push ${DOCKER_USERNAME}/${DOCKER_REPO}:${IMAGE_TAG}

bump-patch : ## Bump patch version.
	npm version patch -m 'Tagging for version %s'