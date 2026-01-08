FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/src/HealthcareAPI/HealthcareAPI.csproj ./HealthcareAPI/
RUN dotnet restore ./HealthcareAPI/HealthcareAPI.csproj
COPY backend/src/HealthcareAPI/ ./HealthcareAPI/
WORKDIR /src/HealthcareAPI
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:5101
EXPOSE 5101
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HealthcareAPI.dll"]
